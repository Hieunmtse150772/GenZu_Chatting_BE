const MessageModel = require('@/model/message.model');

module.exports = async function (req, res, next) {
    try {
        const queryObject = { ...req.query };
        const conversation_id = req.params.id;
        console.log('queryObject: ', queryObject);
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
                $or: [{ message: { $regex: searchText } }],
            };
        }
        let query = MessageModel.find({
            conversation: conversation_id,
        }).find(req.query.search ? searchQuery : JSON.parse(queryString));
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

        const totalCount = await MessageModel.countDocuments().exec();
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

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            // (example for companied sort) sort(price ratings)

            // ?sort=-price,-ratings
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

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
