const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');

const app = express();

// 파일 크기 제한을 10MB로 설정
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// CORS 설정: 프론트엔드 도메인만 허용 (필요에 맞게 수정)
const corsOptions = {
    origin: 'https://back-i4i2.onrender.com', // 실제 프론트엔드 주소로 변경
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));

// JSON 및 URL 인코딩된 데이터 처리
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일을 서빙하는 방법 (예: 'public' 폴더)
app.use(express.static('public'));

// 루트 경로 처리
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// 메일 전송 라우터
app.post('/api/submit', upload.array('files', 10), async (req, res) => {
    const { name, contact, person, character, location, date, contactMethod, message } = req.body;

    // 첨부 파일 처리
    const attachments = req.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
    }));

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
            to: 'siupri125@gmail.com', // 받는 사람 이메일 주소 (필요에 맞게 수정)
            subject: `촬영 문의 - ${name}`,
            text: `
SNS 계정: ${name}
촬영 종류: ${contact}
촬영 인원: ${person}
촬영 캐릭터/컨셉: ${character}
희망 촬영 장소: ${location}
희망 촬영일: ${date}
연락 수단: ${contactMethod}

문의사항:
${message}
            `,
            attachments, // 첨부 파일 추가
        });

        res.status(200).send('문의가 성공적으로 전송되었습니다!');
    } catch (error) {
        console.error(error);
        res.status(500).send('문의 전송에 실패했습니다.');
    }
});

// 서버 포트 설정
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
