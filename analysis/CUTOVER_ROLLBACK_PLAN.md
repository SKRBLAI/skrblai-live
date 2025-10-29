# Cutover and Rollback Plan

## Overview
This document outlines the phased migration strategy from the current Supabase setup to Supabase Boost, including detailed rollback procedures and risk mitigation.

## Pre-Migration Checklist

### T-48 Hours: Boost Project Setup
- [ ] Create new Supabase Boost project
- [ ] Run idempotent schema SQL (from BOOST_MIGRATION_PLAN.md)
- [ ] Create storage buckets (public, private, avatars)
- [ ] Configure bucket policies
- [ ] Set up Google OAuth provider
- [ ] Configure redirect URLs:
  - `https://skrblai.io/auth/callback`
  - `https://skrblai.io/dashboard`
  - `https://skrblai.io/thanks`
  - `https://skrblai.io/cancel`
- [ ] Test database connection and basic queries
- [ ] Verify storage bucket access
- [ ] Test OAuth flow in development

### T-24 Hours: Environment Configuration
- [ ] Add Boost environment variables to Railway
- [ ] Configure Stripe Payment Links
- [ ] Set up feature flags
- [ ] Test environment variable loading
- [ ] Run dry-run build locally
- [ ] Verify all probe endpoints work
- [ ] Test in staging environment

### T-1 Hour: Final Preparation
- [ ] Set maintenance banner (if needed)
- [ ] Backup current database (export critical data)
- [ ] Verify rollback plan is ready
- [ ] Notify team of migration window
- [ ] Prepare monitoring dashboards

## Migration Phases

### Phase 1: Environment Cutover
**Duration**: 5-10 minutes
**Risk**: Medium

#### Steps
1. Update Railway environment variables
2. Deploy application with new environment
3. Verify application starts successfully
4. Test basic functionality

#### Verification
- [ ] Application loads without errors
- [ ] Homepage renders correctly
- [ ] Sign-in page loads
- [ ] Pricing page loads
- [ ] Probe endpoints return JSON

#### Rollback (if needed)
```bash
# Revert environment variables
# Redeploy with previous configuration
# Verify rollback success
```

### Phase 2: Authentication Testing
**Duration**: 10-15 minutes
**Risk**: High

#### Steps
1. Test Google OAuth sign-in flow
2. Test sign-up flow
3. Test callback handling
4. Test dashboard access
5. Test role-based access

#### Verification
- [ ] OAuth flow completes successfully
- [ ] User profile created in Boost
- [ ] Dashboard loads for authenticated users
- [ ] Role-based access works
- [ ] Sign-out works correctly

#### Rollback (if needed)
- Revert to previous environment
- Test authentication still works
- Investigate and fix issues

### Phase 3: Payment System Testing
**Duration**: 10-15 minutes
**Risk**: High

#### Steps
1. Test Stripe Payment Links
2. Test payment flow end-to-end
3. Test success/cancel pages
4. Test revenue tracking

#### Verification
- [ ] Payment Links open correctly
- [ ] Payment process completes
- [ ] Success page loads
- [ ] Revenue events tracked
- [ ] User roles updated after payment

#### Rollback (if needed)
- Revert to previous environment
- Test payment system still works
- Investigate and fix issues

### Phase 4: Full System Validation
**Duration**: 15-20 minutes
**Risk**: Low

#### Steps
1. Test all major user flows
2. Test error handling
3. Test performance
4. Monitor system health

#### Verification
- [ ] All pages load correctly
- [ ] All functionality works
- [ ] Performance is acceptable
- [ ] No critical errors
- [ ] Monitoring shows healthy status

## Rollback Procedures

### Immediate Rollback (0-5 minutes)
**Trigger**: Critical system failure, data loss, or security breach

#### Steps
1. **Revert Environment Variables**
   ```bash
   # In Railway dashboard, revert to previous environment variables
   # This should take 1-2 minutes
   ```

2. **Redeploy Application**
   ```bash
   # Trigger deployment with previous configuration
   # This should take 2-3 minutes
   ```

3. **Verify Rollback**
   - Check application loads
   - Test critical functionality
   - Verify data integrity

### Planned Rollback (5-15 minutes)
**Trigger**: Non-critical issues that need investigation

#### Steps
1. **Set Maintenance Mode**
   ```typescript
   // Add maintenance banner
   // Disable new sign-ups
   // Show maintenance message
   ```

2. **Investigate Issues**
   - Check logs for errors
   - Test specific functionality
   - Identify root cause

3. **Decide on Action**
   - Fix issues and continue
   - Rollback to previous version
   - Implement workaround

### Data Recovery Rollback (15-30 minutes)
**Trigger**: Data corruption or loss

#### Steps
1. **Stop All Traffic**
   - Set maintenance mode
   - Disable new sign-ups
   - Redirect to maintenance page

2. **Restore Data**
   - Restore from backup
   - Verify data integrity
   - Test critical functionality

3. **Gradual Re-enable**
   - Enable read-only access
   - Test functionality
   - Full re-enable

## Risk Mitigation

### High-Risk Areas
1. **Authentication System**
   - Risk: Users cannot sign in
   - Mitigation: Test thoroughly, have rollback ready
   - Monitoring: Auth success/failure rates

2. **Payment System**
   - Risk: Revenue loss
   - Mitigation: Test payment flows, have rollback ready
   - Monitoring: Payment success rates

3. **Database Migration**
   - Risk: Data loss or corruption
   - Mitigation: Backup before migration, test thoroughly
   - Monitoring: Data integrity checks

### Medium-Risk Areas
1. **Performance Degradation**
   - Risk: Slow loading, poor UX
   - Mitigation: Performance testing, monitoring
   - Monitoring: Response times, error rates

2. **Feature Flags**
   - Risk: Features not working
   - Mitigation: Test all flags, have rollback ready
   - Monitoring: Feature usage rates

### Low-Risk Areas
1. **UI Changes**
   - Risk: Visual issues
   - Mitigation: Visual testing, gradual rollout
   - Monitoring: User feedback

2. **Analytics**
   - Risk: Data loss
   - Mitigation: Backup analytics data
   - Monitoring: Analytics data flow

## Monitoring and Alerting

### Key Metrics to Monitor
1. **System Health**
   - Response times
   - Error rates
   - Database connection status
   - Storage access

2. **User Experience**
   - Page load times
   - Authentication success rates
   - Payment success rates
   - User engagement

3. **Business Metrics**
   - Revenue tracking
   - User sign-ups
   - Feature usage
   - Error rates

### Alert Thresholds
- **Critical**: >5% error rate, >2s response time
- **Warning**: >2% error rate, >1s response time
- **Info**: Any system changes, new deployments

### Monitoring Tools
- Railway built-in monitoring
- Custom probe endpoints
- Stripe dashboard
- Google Analytics
- Custom error tracking

## Communication Plan

### Pre-Migration
- [ ] Notify team 24 hours before
- [ ] Post maintenance window notice
- [ ] Prepare status page updates

### During Migration
- [ ] Real-time status updates
- [ ] Progress notifications
- [ ] Issue notifications

### Post-Migration
- [ ] Success confirmation
- [ ] Performance summary
- [ ] Next steps communication

## Success Criteria

### Technical Success
- [ ] All systems operational
- [ ] Performance within acceptable limits
- [ ] No critical errors
- [ ] All monitoring green

### Business Success
- [ ] Users can sign in and use system
- [ ] Payments process correctly
- [ ] Revenue tracking works
- [ ] User experience maintained

### Operational Success
- [ ] Team can monitor system
- [ ] Issues can be resolved quickly
- [ ] Rollback procedures tested
- [ ] Documentation updated

## Post-Migration Tasks

### Immediate (0-24 hours)
- [ ] Monitor system health
- [ ] Test all functionality
- [ ] Address any issues
- [ ] Update documentation

### Short-term (1-7 days)
- [ ] Performance optimization
- [ ] User feedback collection
- [ ] System tuning
- [ ] Monitoring improvements

### Long-term (1-4 weeks)
- [ ] Feature enhancements
- [ ] Performance improvements
- [ ] User experience improvements
- [ ] System scaling

This plan provides a comprehensive approach to migrating to Supabase Boost while minimizing risk and ensuring a smooth transition.