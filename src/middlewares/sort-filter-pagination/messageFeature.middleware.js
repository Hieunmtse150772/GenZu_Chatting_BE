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
        console.log('queryString: ', queryString);

        let searchQuery;
        console.log('conversation_id: ', conversation_id);
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
        if (req.query.messageId) {
            console.log('messageId: ', req.query.messageId);
            searchQuery = { ...searchQuery, _id: { $gte: req.query.messageId } };
        }
        console.log('searchQuery: ', searchQuery);
        let query = Message.find({
            conversation: conversation_id,
            status: { $in: ['active', 'recalled'] },
            deleteBy: { $nin: userId },
        })
            .find(searchQuery ? searchQuery : {})
            .populate('sender', '_id fullName picture')
            .populate('conversation')
            .populate({
                path: 'emojiBy',
                populate: {
                    path: 'sender',
                    select: 'fullName _id',
                },
            });
        // console.log('query: ', query);
        // query = query.map((list) => {
        //     list, (list.message = list.message.replace(/<br>/g, '\n'));
        // });
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {
            currentPage: {
                page,
                limit,
            },
            totalDocs: 0,
        };
        if (!req.query.messageId) {
            const totalCount = await Message.countDocuments({
                conversation: conversation_id,
                status: { $in: ['active', 'recalled'] },
                deleteBy: { $nin: userId },
            }).exec();

            results.totalDocs = totalCount;

            if (endIndex < totalCount) {
                results.next = {
                    page: page + 1,
                    limit,
                };
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit,
                };
            }

            results.totalPages = Math.ceil(totalCount / limit);
            results.lastPage = Math.ceil(totalCount / limit);

            // If requested page don't exist
            if (req.query.page && Number(req.query.page) > Math.ceil(totalCount / limit)) {
                // throw new Error(`This page don't exist`);
            }

            // Final pagination query
            query = query.limit(limit).skip(startIndex);
        }

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
        results.results = results.results.map((result) => {
            // Thay đổi giá trị của message dựa trên điều kiện
            return {
                ...result,
                message: result.status === 'recalled' ? 'Message has been recalled' : result.message,
            };
        });
        // Add paginated Results to the request
        res.paginatedResults = results;
        next();
    } catch (error) {
        return next(error);
    }
};
