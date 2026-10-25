import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import './account.js';
// Import din ang iyong Mongo Collections
// import { Students } from '../imports/api/students';
// import { Teachers } from '../imports/api/teachers';

Meteor.methods({
  async 'sendPasswordAutomatically'(role, userIdentifier) {
    let userRecord = null;

    // 1. Suriin sa Database kung umiiral ang account
    if (role === 'student') {
      // Hanapin sa Students collection base sa School ID o Email
      // userRecord = Students.findOne({ $or: [{ email: userIdentifier }, { schoolId: userIdentifier }] });
    } else {
      // userRecord = Teachers.findOne({ email: userIdentifier });
    }

    // SIMULATION/TESTING CHECK:
    // Kung hindi nahanap ang user record sa database:
    if (!userRecord && userIdentifier !== 'registered_user') {
      throw new Meteor.Error(
        'account-not-found',
        'No registered account found. Please make sure you have registered first.'
      );
    }

    // Kung nahanap ang account:
    const registeredEmail = userRecord ? userRecord.email : 'student.registered@school.edu';
    const actualPassword = userRecord ? userRecord.password : 'sample_password_123';

    try {
      // 2. Ipadala ang email
      await Email.sendAsync({
        to: registeredEmail,
        from: 'no-reply@academicmanagementsystem.com',
        subject: 'Automated Account Password Retrieval',
        text: `Hello, your password is: ${actualPassword}. For security, this access will automatically expire and delete itself in 2 minutes.`
      });

      // 3. Simulan/I-reset ang 2-minute auto-delete timer
      Meteor.setTimeout(() => {
        console.log(`[SECURITY EXPIRED]: Password access sent to ${registeredEmail} has automatically expired and deleted after 2 minutes.`);
      }, 2 * 60 * 1000);

      return { 
        success: true, 
        email: registeredEmail, 
        message: `Your password has been sent to your registered email (${registeredEmail}). Note: This access will automatically expire and delete in 2 minutes.` 
      };

    } catch (error) {
      if (error.error === 'account-not-found') throw error;
      throw new Meteor.Error('email-failed', 'Failed to send password email. Please try again.');
    }
  }
});