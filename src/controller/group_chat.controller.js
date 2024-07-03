const { default: STATUS_CODE } = require('@/enums/statusCode.enum');
const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');
const { STATUS_MESSAGE_CODE, STATUS_MESSAGE } = require('@/enums/statusMessage.enum');

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

            return res.status(201).json({
                data: fullGroupChatInfo,
                message: 'Create group chat successful',
                messageCode: 'create_group_chat_successful',
            });
        } catch (error) {
            return next(error);
        }
    },
    addMemberGroupChat: async (req, res, next) => {
        // const userId = req.user._id;
        // console.log('userId: ', userId);

        // if (!req.body.users || !req.body.name) {
        //     return res.status(400).send({ message: 'Please Fill all the field!' });
        // }
        // var users = JSON.parse(req.body.users);

        // if (users.length < 2) {
        //     return res.status(400).send({ message: 'Please add more than 1 user to create a group chat!' });
        // }

        // users.push(userId);

        try {
            // const groupChat = await Conversation.create({
            //     chatName: req.body.name,
            //     isGroupChat: true,
            //     users: users,
            //     groupAdmin: userId,
            // });
            // const fullGroupChatInfo = await Conversation.findOne({
            //     _id: groupChat._id,
            // })
            //     .populate('users', 'picture fullName _id email')
            //     .populate('groupAdmin', 'picture fullName _id email');
            return res.status(201).json({
                data: fullGroupChatInfo,
                message: 'Create group chat successful',
                messageCode: 'create_group_chat_successful',
            });
        } catch (error) {
            return next(error);
        }
    },
    deleteMemberGroupChat: async (req, res, next) => {
        // const userId = req.user._id;
        // console.log('userId: ', userId);

        // if (!req.body.users || !req.body.name) {
        //     return res.status(400).send({ message: 'Please Fill all the field!' });
        // }
        // var users = JSON.parse(req.body.users);

        // if (users.length < 2) {
        //     return res.status(400).send({ message: 'Please add more than 1 user to create a group chat!' });
        // }

        // users.push(userId);

        try {
            // const groupChat = await Conversation.create({
            //     chatName: req.body.name,
            //     isGroupChat: true,
            //     users: users,
            //     groupAdmin: userId,
            // });
            // const fullGroupChatInfo = await Conversation.findOne({
            //     _id: groupChat._id,
            // })
            //     .populate('users', 'picture fullName _id email')
            //     .populate('groupAdmin', 'picture fullName _id email');
            return res.status(201).json({
                data: fullGroupChatInfo,
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

            return res.status(200).json({
                data: newGroup,
                message: 'Update group chat successful',
                messageCode: 'update_group_chat_successful',
            });
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
                res.status(400).json({
                    message: STATUS_MESSAGE.GROUP_NOT_FOUND,
                    messageCode: STATUS_MESSAGE_CODE.GROUP_NOT_FOUND,
                    status: STATUS_CODE.NOT_FOUND,
                });
            }

            if (!userId.equals(group.groupAdmin)) {
                res.status(403).json({
                    message: STATUS_CODE.FORBIDDEN,
                    messageCode: STATUS_MESSAGE_CODE.FORBIDDEN,
                    status: STATUS_CODE.FORBIDDEN,
                });
            }

            const result = await Conversation.deleteOne({ _id: group._id });

            console.log(result);

            return res.status(200).json({
                message: STATUS_MESSAGE.DELETE_GROUP_SUCCESS,
                messageCode: STATUS_MESSAGE_CODE.DELETE_GROUP_SUCCESS,
            });
        } catch (error) {
            return next(error);
        }
    },
};
