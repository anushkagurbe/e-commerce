import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

export let sendRegistrationEmail = async (email, username ) =>{
    let html = `<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">
                    <div style="background-color:#f4f6f9; padding:60px 20px; text-align:center;">
                        <div style="max-width:500px; margin:0 auto; background:#ffffff; padding:40px; border-radius:10px;">
                            <div style="font-size:50px; color:#2ecc71; margin-bottom:20px;">
                                ✔
                            </div>
                            <h1 style="margin:0; font-size:24px; color:#333333;">
                                Registration Successful!
                            </h1>
                            <p style="font-size:16px; color:#555555; line-height:1.6; margin:20px 0;">
                                Hello <strong>${username}</strong>,<br><br>
                                Your account has been successfully created.
                                You can now log in and start using our services.
                            </p>
                        </div>
                    </div>
                </body>`;

    await transporter.sendMail({
        from: `"Ecommerce App" <${process.env.EMAIL}>`,
        to: email,
        subject: "Account Registration Confirmation",
        html
    });
}