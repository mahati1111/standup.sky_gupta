import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fanSiteRouter from "./fan-site";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(fanSiteRouter);

export default router;
