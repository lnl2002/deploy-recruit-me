import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import Account, { IAccount } from './models/accountModel'
import Role, { IRole } from './models/roleModel'
import validator from 'validator'

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile?.emails[0]?.value || ''

                if (!email || !validator.isEmail(email)) {
                    throw new Error('Invalid email')
                }
                const sanitizedEmail = String(email).trim()

                let user: IAccount = await Account.findOne({ email: sanitizedEmail }).setOptions({sanitizeFilter: true}).populate('role')

                if (!user) {
                    const defaultRole = await Role.findOne({ roleName: 'CANDIDATE' })

                    // Nếu người dùng chưa tồn tại, tạo mới với role mặc định là 'CANDIDATE'
                    user = await Account.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: sanitizedEmail,
                        role: defaultRole._id,
                        image: profile?.photos[0]?.value || '',
                    })

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user.role = defaultRole as any
                }
                const tokenPayload = {
                    _id: user._id,
                    displayName: user.name,
                    email: user.email,
                    role: (user.role as IRole)?.roleName || '',
                    image: user.image,
                }

                done(null, tokenPayload)
            } catch (error) {
                done(error, null)
            }
        },
    ),
)
