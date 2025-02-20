import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import 'dotenv/config'; // 환경 변수 로드

const app = express();

// 파일 업로드 설정 (최대 10MB)
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 },
});

// CORS 설정 (프론트엔드 Netlify 도메인 허용)
app.use(cors({
    origin: 'https://radididadadidi.netlify.app', // 실제 Netlify 도메인으로 변경
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 환경 변수 로드 확인 (디버깅용)
console.log("✅ EMAIL_USER:", process.env.EMAIL_USER || "❌ Not set");
console.log("✅ EMAIL_PASS:", process.env.EMAIL_PASS ? "🔒 Loaded" : "❌ Not set");
console.log("✅ RECEIVER_EMAIL:", process.env.RECEIVER_EMAIL || "❌ Not set");

// 루트 경로
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// 문의 제출 API
app.post('/api/submit', upload.array('files', 10), async (req, res) => {
    console.log("📩 /api/submit 호출됨:", req.body); // 요청 데이터 로깅
    const { name, contact, person, character, location, date, contactMethod, snsid, message } = req.body;

    // 첨부 파일 처리
    const attachments = req.files ? req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
    })) : [];

    // Nodemailer 설정
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL,
            subject: `촬영 문의 - ${name}`,
            text: `
SNS 계정: ${name}
촬영 종류: ${contact}
촬영 인원: ${person}
촬영 캐릭터/컨셉: ${character}
희망 촬영 장소: ${location}
희망 촬영일: ${date}
연락 수단: ${contactMethod}
연락 방법: ${snsid}

문의사항:
${message}
            `,
            attachments, // 첨부 파일 포함
        });
        console.log("✅ 메일 전송 성공");
        res.status(200).send('문의가 성공적으로 전송되었습니다!');
    } catch (error) {
        console.error('❌ 메일 전송 실패:', error);
        res.status(500).send('문의 전송에 실패했습니다.');
    }
});

// 서버 시작
const port = process.env.PORT || 3000; // Render에서 제공하는 PORT 사용
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
}).on('error', (err) => {
    console.error("❌ Server failed to start:", err);
});

// 프로세스 종료 시 로그 추가
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});