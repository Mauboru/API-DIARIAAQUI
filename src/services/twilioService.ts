import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendVerificationCodeService = async (phone_number: string) => {
  try {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    await client.messages.create({
      body: `Seu código de verificação: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number,
    });

    return { success: true, code };
  } catch (error) {
    console.error("Erro ao enviar código de verificação:", error);
    return { success: false, message: "Erro ao enviar o código." };
  }
};
