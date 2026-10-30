/* pay-config.js - KN online payment links, one per plan.
   Paste each plan's Stripe payment link between the quotes (it starts with https://buy.stripe.com/).
   A plan left as '' takes the order by form instead and we send the payment link by email. */
window.KN_PAY = {
  launch: 'https://buy.stripe.com/4gM3cw0s09XObMi5zk28800',      // Launch website plan      $99 a month
  business: 'https://buy.stripe.com/00weVeb6E3zqeYu8Lw28801',    // Business website plan    $179 a month
  pro: 'https://buy.stripe.com/7sY14odeMee43fM8Lw28802',         // Pro website plan         $329 a month
  store: 'https://buy.stripe.com/14AbJ2deM8TK17E9PA28803',       // Store website plan       $499 a month
  essential: 'https://buy.stripe.com/28E9AU6Qo5Hy9Ea4vg28804',   // Essential social plan    $499 a month
  growth: 'https://buy.stripe.com/cNi3cweiQ6LC03A2n828805',      // Growth social plan       $899 a month
  full: 'https://buy.stripe.com/7sY28sgqY9XOcQmf9U28806'         // Full social plan         $1,799 a month
};
