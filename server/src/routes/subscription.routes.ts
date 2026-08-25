import { Router } from 'express';
import { 
  initiateSubscription, 
  handlePaymentSuccess, 
  handlePaymentFail, 
  getCurrentSubscription 
} from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';
import express from 'express';

const router = Router();

// To handle PayU redirects correctly, these must not be blocked by JWT token requirements
// PayU sends POST requests from their server directly, so no JWT token is present on success/fail URLs.
router.post('/success', express.urlencoded({ extended: true }), handlePaymentSuccess);
router.post('/fail', express.urlencoded({ extended: true }), handlePaymentFail);

// Protected routes for the user
router.use(authenticate);
router.post('/initiate', initiateSubscription);
router.get('/current', getCurrentSubscription);

export default router;
