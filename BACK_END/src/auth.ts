import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import Account, { IAccount } from './models/accountModel'
import Role, { IRole } from './models/roleModel'
import DOMPurify from 'dompurify' // Import DOMPurify

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let email = profile?.emails[0]?.value || ''

                email = String(email).trim();

                let user: IAccount = await Account.findOne({
                    email: email
                }).populate('role')

                if (!user) {
                    const defaultRole = await Role.findOne({ roleName: 'CANDIDATE' })

                    // Sanitize dữ liệu từ Google Profile
                    const sanitizedName = DOMPurify.sanitize(profile.displayName)
                    const sanitizedEmail = DOMPurify.sanitize(profile.emails[0].value)
                    const sanitizedImage = DOMPurify.sanitize(profile?.photos[0]?.value || '')

                    // Tạo người dùng mới với dữ liệu đã được sanitize
                    user = await Account.create({
                        googleId: profile.id,
                        name: sanitizedName,
                        email: sanitizedEmail,
                        role: defaultRole._id,
                        image: sanitizedImage,
                    })

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user.role = defaultRole as any
                }

                const tokenPayload = {
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
