export const htmlBaseLayout = (content: string): string => {
    return (
    `
        <!DOCTYPE html>
        <html>

        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RecruitMe Meeting Schedule</title>
        </head>

        <body style="margin: 0; padding: 0; background-color: aliceblue; font-family: Arial, sans-serif;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td align="center" style="padding: 20px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="1080" style="background-color: white;">
                            <!-- Header -->
                            <tr>
                                <td style="border-top: 5px solid #f36523;">
                                    <table cellpadding="20" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td style="background-color: #fceae1;">
                                                <table cellpadding="0" cellspacing="0" border="0">
                                                    <tr>
                                                        <td style="padding-right: 10px;">
                                                            <img height="50"
                                                                src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/logo.png?alt=media&token=47b0093a-87d3-473f-876b-1a5b018aca76"
                                                                alt="Company Logo" />
                                                        </td>
                                                        <td>
                                                            <h2 style="color: #ff6b35; margin: 0; font-size: 24px;">RecruitMe
                                                            </h2>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Body -->
                            ${content}

                            <!-- Footer -->
                            <tr>
                                <td style="padding-top: 100px;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td style="height: 1px; background-color: #f365237d; margin-bottom: 40px;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 40px 20px;">
                                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <!-- Company Info -->
                                                        <td style="width: 33%; vertical-align: top; padding-right: 20px;">
                                                            <img width="35" height="35"
                                                                src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/logo.png?alt=media&token=47b0093a-87d3-473f-876b-1a5b018aca76"
                                                                alt="Company Logo" style="margin-bottom: 10px;" />
                                                            <h2 style="color: #ff6b35; margin: 0; font-size: 18px;">RecruitMe
                                                            </h2>
                                                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                                                Your Trusted Recruitment Partner<br />
                                                                Connecting Talent with Opportunity
                                                            </p>
                                                        </td>

                                                        <!-- Contact Info -->
                                                        <td style="width: 33%; vertical-align: top; padding-right: 20px;">
                                                            <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">
                                                                Contact us</h3>
                                                            <table cellpadding="0" cellspacing="0" border="0">
                                                                <tr>
                                                                    <td style="padding-bottom: 8px;">
                                                                        <img src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/phone.png?alt=media&token=211d9843-242e-4b47-9a77-9132a69081ea"
                                                                            alt="Phone Icon"
                                                                            style="vertical-align: middle; margin-right: 8px;" />
                                                                        <a href="tel:+1234567890"
                                                                            style="color: #666; text-decoration: none; font-size: 14px;">+1
                                                                            (234) 567-8900</a>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding-bottom: 8px;">
                                                                        <img src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/mail-01.png?alt=media&token=348ed155-32ae-40bf-bc59-e202af51c500"
                                                                            alt="Email Icon"
                                                                            style="vertical-align: middle; margin-right: 8px;" />
                                                                        <a href="mailto:contact@recruitme.com"
                                                                            style="color: #666; text-decoration: none; font-size: 14px;">contact@recruitme.com</a>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <img src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/Facebook%20logo.png?alt=media&token=924cf0f3-5c83-4316-a199-36308452089c"
                                                                            alt="Website Icon"
                                                                            style="vertical-align: middle; margin-right: 8px;" />
                                                                        <a href="https://www.recruitme.com"
                                                                            style="color: #666; text-decoration: none; font-size: 14px;">www.recruitme.com</a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>

                                                        <!-- Social Media -->
                                                        <td style="width: 33%; vertical-align: top;">
                                                            <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">Follow
                                                                us</h3>
                                                            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                                                                Follow us on our social media platforms<br />
                                                                to stay connected!
                                                            </p>
                                                            <table cellpadding="0" cellspacing="0" border="0">
                                                                <tr>
                                                                    <td style="padding-right: 10px;">
                                                                        <a href="#" style="text-decoration: none;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/fcaebook_round.png?alt=media&token=7a203e98-434b-4fd5-93b1-c0dec801a1ae"
                                                                                alt="Facebook" />
                                                                        </a>
                                                                    </td>
                                                                    <td style="padding-right: 10px;">
                                                                        <a href="#" style="text-decoration: none;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/LinkedIn%20logo.png?alt=media&token=a8f1e4d4-8a2a-4e36-9fdb-0c9fc272baf5"
                                                                                alt="LinkedIn" />
                                                                        </a>
                                                                    </td>
                                                                    <td>
                                                                        <a href="#" style="text-decoration: none;">
                                                                            <img src="https://firebasestorage.googleapis.com/v0/b/toan-cau-craft-dev.appspot.com/o/Social%20Icons.png?alt=media&token=1dcf724d-7280-4844-b835-bd550ca4b7e0"
                                                                                alt="Instagram" />
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- Copyright -->
                                        <tr>
                                            <td style="background-color: #f36523; padding: 5px 0;">
                                                <p style="color: #ffffff; font-size: 12px; margin: 0; text-align: center;">
                                                    Copyright 2024 RecruitMe. All Rights Reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>

        </html>
    `
    )
}