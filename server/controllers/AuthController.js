const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  static async googleSignIn(req, res, next) {
    try {
      const { idToken } = req.body;

      if (!idToken) throw { status: 400, message: "idToken required" };

      // verify token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const [user] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          name: payload.name,
          picture: payload.picture,
        },
      });

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
