const isAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "moderator")) {
            throw new Error("Доступ запрещен");
        } 
        
        next();
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

module.exports = {
    isAdmin,
};
