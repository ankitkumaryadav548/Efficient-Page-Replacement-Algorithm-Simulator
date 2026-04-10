import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simulateRouter from "./simulate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simulateRouter);

export default router;
