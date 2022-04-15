const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(400).json({
      success: false,
      message: "You must login!",
    });
  try {
    const detoken = jwt.verify(token, process.env.JWT);
    req.userId = detoken.userId;
    if (detoken.role === 0) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Error Token",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({
      success: false,
      message: "Error Token",
    });
  }
};

module.exports = verifyToken;
