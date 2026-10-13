import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fanSiteRouter from "./fan-site";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fanSiteRouter);

export default router;
