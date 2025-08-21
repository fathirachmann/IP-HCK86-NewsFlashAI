const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");
const { httpError } = require("../utils/httpError");
const { signToken } = require("../utils/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  static async googleSignIn(req, res, next) {
    try {
      const { idToken } = req.body;
      if (!idToken) throw httpError.badRequest("idToken required");

      let payload;
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (e) {
        const err = new Error("Invalid Google ID token");
        err.name = "GoogleAuthError";
        throw err;
      }

      const [user] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: { name: payload.name, picture: payload.picture }
      });

      const token = signToken({ id: user.id, email: user.email });

      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        access_token: token
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;