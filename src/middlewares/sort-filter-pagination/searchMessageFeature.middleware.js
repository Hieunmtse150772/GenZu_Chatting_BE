const Message = require('@/model/message.model');

module.exports = async function (req, res, next) {
    try {
        const queryObject = { ...req.query };
        const userId = req.user._id;
        const conversation_id = req.query.id;
        const excludedFiled = ['sort', 'limit', 'page', 'field'];
        excludedFiled.forEach((ele) => delete queryObject[ele]);
        let queryString = JSON.stringify(queryObject);
        const reg = /\bgte|gt|lte|lt\b/g;
        queryString = queryString.replace(reg, (matchString) => `$${matchString}`);
        // Search
        let searchQuery;
        if (req.query.search) {
            const searchText = req.query.search.toLowerCase();
            searchQuery = {
                $or: [{ message: { $regex: searchText, $options: 'i' } }],
            };
        }
        // Date Range
        const dateQuery = {};
        if (req.query.startDate) {
            dateQuery.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            dateQuery.$lte = new Date(req.query.endDate);
        }
        if (req.query.startDate || req.query.endDate) {
            searchQuery = { createdAt: dateQuery };
        }
        if (req.query.sender) {
            searchQuery = { sender: req.query.sender, ...searchQuery };
        }
        console.log('searchQuery: ', searchQuery);
        let query = Message.find({
            conversation: conversation_id,
            status: 'active',
            deleteBy: { $nin: userId },
        })
            .find(req.query.search ? searchQuery : {})
            .populate('sender', '_id fullName picture')
            .populate('conversation')
            .populate({
                path: 'emojiBy',
                populate: {
                    path: 'sender',
                    select: 'fullName _id',
                },
            });

        const results = {
            totalDocs: 0,
        };

        const totalCount = await Message.countDocuments().exec();

        results.totalDocs = totalCount;

        query = query.sort('-createdAt');

        // Fields Limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');

            // ?filed=price,description,ratings
            query = query.select(fields);
        } else {
            query = query.select('-_v');
        }

        results.results = await query.exec();

        // Add paginated Results to the request
        res.paginatedResults = results;
        next();
    } catch (error) {
        return next(error);
    }
};
