import express, { Request, Response } from 'express';
import { generateStudyKit } from './geminiService';
import { SubjectType, ClassLevel, DepthSetting } from '../src/types/neet';

export const apiRouter = express.Router();

apiRouter.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));

apiRouter.options('*', (_req: Request, res: Response) => {
  res.sendStatus(204);
});

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NEET Deep-Recall Engine',
  });
});

apiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { pdfBase64, subject, classLevel, depth, chapterTitleHint } = req.body;

    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      res.status(400).json({ error: 'Missing or invalid pdfBase64 document in request payload.' });
      return;
    }

    const validSubjects: SubjectType[] = ['Physics', 'Chemistry', 'Biology'];
    const chosenSubject: SubjectType = validSubjects.includes(subject) ? subject : 'Biology';

    const validClasses: ClassLevel[] = ['11', '12'];
    const chosenClass: ClassLevel = validClasses.includes(classLevel) ? classLevel : '11';

    const validDepths: DepthSetting[] = ['quick', 'standard', 'deep'];
    const chosenDepth: DepthSetting = validDepths.includes(depth) ? depth : 'standard';

    console.log(`[API /generate] Processing chapter generation: ${chosenSubject} Class ${chosenClass} (${chosenDepth} depth)`);

    const studyKit = await generateStudyKit({
      pdfBase64,
      subject: chosenSubject,
      classLevel: chosenClass,
      depth: chosenDepth,
      chapterTitleHint,
    });

    res.json({
      success: true,
      studyKit,
    });
  } catch (error: any) {
    console.error('[API /generate Error]:', error);
    const message = error.message || 'An unexpected error occurred during study kit generation.';
    const isRateLimit = message.includes('free-tier limit') || message.includes('quota') || message.includes('429');
    const is401 = message.includes('401') || message.includes('authentication') || error?.status === 401;

    const statusCode = is401 ? 401 : isRateLimit ? 429 : 500;

    res.status(statusCode).json({
      success: false,
      error: message,
      isAuthError: is401,
      isRateLimit,
      rateLimitUrl: 'https://aistudio.google.com/rate-limit',
    });
  }
});

export const apiApp = express();
apiApp.use(express.json({ limit: '50mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
apiApp.use('/api', apiRouter);
apiApp.use('/', apiRouter);

