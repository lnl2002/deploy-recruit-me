import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import Account, { IAccount } from './models/accountModel'
import Role, { IRole } from './models/roleModel'

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user: IAccount = await Account.findOne({ googleId: profile.id }).populate('role');
                console.log('user', user);


                if (!user) {
                    const defaultRole = await Role.findOne({ roleName: 'CANDIDATE' })

                    console.log('defaultRole', profile);

                    // Nếu người dùng chưa tồn tại, tạo mới với role mặc định là 'CANDIDATE'
                    user = await Account.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        role: defaultRole._id,
                        image: profile?.photos[0]?.value || ''
                    })

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user.role = defaultRole as any;
                }
                const tokenPayload = {
                    googleId: user.googleId,
                    displayName: user.name,
                    email: user.email,
                    role: (user.role as IRole)?.roleName || '',
                }

                const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '1h' })
                done(null, token)
            } catch (error) {
                done(error, null)
            }
        },
    ),
)
