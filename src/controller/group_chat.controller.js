const { ObjectId } = require('mongodb');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');
const { STATUS_CODE, STATUS_MESSAGE, MESSAGE_CODE } = require('@/enums/response');
const createResponse = require('@/utils/responseHelper');

module.exports = {
    createGroupChat: async (req, res, next) => {
        const userId = req.user._id;
        const users = req.body.users;
        let latestMessage;

        users.push(userId);

        try {
            const groupChat = await Conversation.create({
                chatName: req.body.chatName,
                avatar: req.body.avatar,
                background: req.body.background,
                isGroupChat: true,
                users: users,
                groupAdmin: userId,
            });

            users.forEach(async (item) => {
                latestMessage = await Message.create({
                    sender: userId,
                    message: 'add_to_group',
                    conversation: groupChat,
                    status: 'active',
                    affected_user_id: item,
                    message_type: 'notification',
                });
            });

            const fullGroupChatInfo = await Conversation.findById(groupChat._id)
                .populate('users', 'picture fullName _id email')
                .populate('groupAdmin', 'picture fullName _id email');

            return res
                .status(STATUS_CODE.CREATED)
                .json(
                    createResponse(
                        fullGroupChatInfo,
                        STATUS_MESSAGE.CREATE_GROUP_SUCCESSFULLY,
                        MESSAGE_CODE.CREATE_GROUP_SUCCESSFULLY,
                        STATUS_CODE.CREATED,
                        true,
                    ),
                );
        } catch (error) {
            return next(error);
        }
    },
    addMemberGroupChat: async (req, res, next) => {
        const groupId = req.params.id;
        const newUsers = req.body.users;

        try {
            const group = await Conversation.findById(groupId);

            if (!group) {
                return res
                    .status(STATUS_CODE.NOT_FOUND)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.GROUP_NOT_FOUND,
                            MESSAGE_CODE.GROUP_NOT_FOUND,
                            STATUS_CODE.NOT_FOUND,
                            false,
                        ),
                    );
            }

            const currentUsersSet = new Set(group.users.map((user) => user.toString()));
            const duplicateUsers = newUsers.filter((user) => currentUsersSet.has(user.toString()));

            if (duplicateUsers.length > 0) {
                return res
                    .status(STATUS_CODE.CONFLICT)
                    .json(
                        createResponse(
                            duplicateUsers,
                            STATUS_MESSAGE.MEMBER_ALREADY_EXIST_IN_GROUP,
                            MESSAGE_CODE.MEMBER_ALREADY_EXIST_IN_GROUP,
                            STATUS_CODE.CONFLICT,
                            false,
                        ),
                    );
            }

            group.users.push(...newUsers);

            const newGroup = await group.save();

            return res
                .status(STATUS_CODE.OK)
                .json(
                    createResponse(
                        newGroup,
                        STATUS_MESSAGE.ADD_MEMBER_TO_GROUP_SUCCESS,
                        MESSAGE_CODE.ADD_MEMBER_TO_GROUP_SUCCESSFULLY,
                        STATUS_CODE.OK,
                        true,
                    ),
                );
        } catch (error) {
            return next(error);
        }
    },
    deleteMemberGroupChat: async (req, res, next) => {
        const groupId = req.params.id;
        const userId = req.user._id;
        const exchangeAdminId = new ObjectId(req.body.exchangeAdmin);
        const memberId = new ObjectId(req.body.memberId);

        try {
            const group = await Conversation.findById(groupId);
            let userDeleteInGroup;
            let memberIsExis;

            if (!group) {
                return res
                    .status(STATUS_CODE.NOT_FOUND)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.GROUP_NOT_FOUND,
                            MESSAGE_CODE.GROUP_NOT_FOUND,
                            STATUS_CODE.NOT_FOUND,
                            false,
                        ),
                    );
            }

            group.users.forEach((item) => {
                if (item.equals(memberId)) {
                    memberIsExis = item;
                }
                if (item.equals(userId)) {
                    userDeleteInGroup = item;
                }
            });

            if (!userDeleteInGroup) {
                return res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.USER_NOT_IN_GROUP,
                            MESSAGE_CODE.USER_NOT_IN_GROUP,
                            STATUS_CODE.FORBIDDEN,
                            false,
                        ),
                    );
            }

            if (!memberIsExis) {
                return res
                    .status(STATUS_CODE.NOT_FOUND)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.MEMBER_NOT_FOUND,
                            MESSAGE_CODE.MEMBER_NOT_FOUND,
                            STATUS_CODE.NOT_FOUND,
                            false,
                        ),
                    );
            }

            if (!userId.equals(group.groupAdmin)) {
                // not admin and delete others
                if (!userId.equals(memberId)) {
                    return res
                        .status(STATUS_CODE.FORBIDDEN)
                        .json(createResponse(null, STATUS_MESSAGE.FORBIDDEN, null, STATUS_CODE.FORBIDDEN, false));
                    // not admin and delete self
                } else {
                    group.users = group.users.filter((item) => !item.equals(userId));
                    const latestMessage = await Message.create({
                        sender: userId,
                        message: MESSAGE_CODE.USER_LEAVE_IN_GROUP,
                        conversation: group._id,
                        status: 'active',
                        affected_user_id: userId,
                        message_type: 'notification',
                    });

                    group.latestMessage = latestMessage;
                    const newGroup = await group.save();
                    return res
                        .status(STATUS_CODE.OK)
                        .json(
                            createResponse(
                                newGroup,
                                STATUS_MESSAGE.DELETE_MEMBER_SUCCESS,
                                MESSAGE_CODE.DELETE_MEMBER_SUCCESSFULLY,
                                STATUS_CODE.OK,
                                true,
                            ),
                        );
                }
            } else {
                // la admin xoa nguoi khac
                if (!userId.equals(memberId)) {
                    group.users = group.users.filter((item) => !item.equals(memberId));
                    const latestMessage = await Message.create({
                        sender: userId,
                        message: MESSAGE_CODE.DELETE_USER_IN_GROUP,
                        conversation: group._id,
                        status: 'active',
                        affected_user_id: memberId,
                        message_type: 'notification',
                    });

                    group.latestMessage = latestMessage;
                    const newGroup = await group.save();
                    return res
                        .status(STATUS_CODE.OK)
                        .json(
                            createResponse(
                                newGroup,
                                STATUS_MESSAGE.DELETE_MEMBER_SUCCESS,
                                MESSAGE_CODE.DELETE_MEMBER_SUCCESSFULLY,
                                STATUS_CODE.OK,
                                true,
                            ),
                        );
                } else {
                    // la admin xoa chinh minh
                    if (!req.body.exchangeAdmin) {
                        return res
                            .status(STATUS_CODE.BAD_REQUEST)
                            .json(
                                createResponse(
                                    null,
                                    STATUS_MESSAGE.EXCHANGE_ADMIN_ID_REQUIRED,
                                    MESSAGE_CODE.EXCHANGE_ADMIN_ID_REQUIRED,
                                    STATUS_CODE.BAD_REQUEST,
                                    false,
                                ),
                            );
                    }

                    const userExist = group.users.find((item) => item.equals(exchangeAdminId));

                    if (!userExist) {
                        return res
                            .status(STATUS_CODE.NOT_FOUND)
                            .json(
                                createResponse(
                                    null,
                                    STATUS_MESSAGE.MEMBER_NOT_FOUND,
                                    MESSAGE_CODE.MEMBER_NOT_FOUND,
                                    STATUS_CODE.NOT_FOUND,
                                    false,
                                ),
                            );
                    }

                    // if users have more than 2 members
                    if (group.users.length > 1) {
                        // update groupAdmin to new user
                        group.groupAdmin = exchangeAdminId;
                        await Message.create({
                            sender: userId,
                            message: MESSAGE_CODE.TRANSFER_GROUP_LEADER,
                            conversation: group._id,
                            status: 'active',
                            affected_user_id: exchangeAdminId,
                            message_type: 'notification',
                        });

                        // delete self from the group
                        group.users.pull(memberId);
                        const latestMessage = await Message.create({
                            sender: userId,
                            message: MESSAGE_CODE.USER_LEAVE_IN_GROUP,
                            conversation: group._id,
                            status: 'active',
                            affected_user_id: userId,
                            message_type: 'notification',
                        });

                        group.latestMessage = latestMessage;
                        const newGroup = await group.save();
                        return res
                            .status(STATUS_CODE.OK)
                            .json(
                                createResponse(
                                    newGroup,
                                    STATUS_MESSAGE.DELETE_MEMBER_SUCCESS,
                                    MESSAGE_CODE.DELETE_MEMBER_SUCCESSFULLY,
                                    STATUS_CODE.OK,
                                    true,
                                ),
                            );

                        // if users have less than 2 members
                    } else {
                        // delete group
                        await Conversation.deleteOne({ _id: group._id });
                        return res.status(STATUS_CODE.NO_CONTENT).json();
                    }
                }
            }
        } catch (error) {
            return next(error);
        }
    },
    updateGroupChat: async (req, res, next) => {
        const userId = req.user._id;
        const groupId = req.params.id;

        try {
            const group = await Conversation.findById(groupId);

            let latestMessage;

            if (req.body.avatar) {
                group.avatar = req.body.avatar;
                latestMessage = await Message.create({
                    sender: userId,
                    message: 'changed_avatar',
                    conversation: groupId,
                    status: 'active',
                    message_type: 'notification',
                });
            }

            if (req.body.background) {
                group.background = req.body.background;
                latestMessage = await Message.create({
                    sender: userId,
                    message: 'changed_background',
                    conversation: groupId,
                    status: 'active',
                    message_type: 'notification',
                });
            }

            if (req.body.chatName) {
                latestMessage = await Message.create({
                    sender: userId,
                    message: `changed_group_name ${group.chatName} ${req.body.chatName}`,
                    conversation: groupId,
                    status: 'active',
                    message_type: 'notification',
                });
                group.chatName = req.body.chatName;
            }

            group.latestMessage = latestMessage;

            const newGroup = await group.save();

            return res
                .status(STATUS_CODE.OK)
                .json(
                    createResponse(
                        newGroup,
                        STATUS_MESSAGE.UPDATE_GROUP_SUCCESSFULLY,
                        MESSAGE_CODE.UPDATE_GROUP_SUCCESSFULLY,
                        STATUS_CODE.OK,
                        true,
                    ),
                );
        } catch (error) {
            return next(error);
        }
    },
    deleteGroupChat: async (req, res, next) => {
        const userId = req.user._id;
        const groupId = req.params.id;

        try {
            const group = await Conversation.findById(groupId);

            if (!group) {
                return res
                    .status(STATUS_CODE.NOT_FOUND)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.GROUP_NOT_FOUND,
                            MESSAGE_CODE.GROUP_NOT_FOUND,
                            STATUS_CODE.NOT_FOUND,
                            false,
                        ),
                    );
            }

            if (!userId.equals(group.groupAdmin)) {
                return res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(
                        createResponse(
                            null,
                            STATUS_MESSAGE.FORBIDDEN,
                            STATUS_CODE.FORBIDDEN,
                            STATUS_CODE.FORBIDDEN,
                            false,
                        ),
                    );
            }

            await Conversation.deleteOne({ _id: group._id });

            return res.status(STATUS_CODE.NO_CONTENT).json();
        } catch (error) {
            return next(error);
        }
    },
};
