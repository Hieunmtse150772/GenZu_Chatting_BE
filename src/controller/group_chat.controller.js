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
                    invitedUser: item,
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
        const memberId = req.body.id;
        console.log(groupId, memberId);
        try {
            return res.status(201).json({
                message: 'Create group chat successful',
                messageCode: 'create_group_chat_successful',
            });
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
