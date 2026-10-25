import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  async registerUser(userData) {
    if (!userData || !userData.username || !userData.password) {
      throw new Meteor.Error('invalid-data', 'Username and password are required.');
    }

    const username = userData.username.trim();

    // Meteor 3: these are async, so they must be awaited
    if (await Accounts.findUserByUsername(username)) {
      throw new Meteor.Error('user-exists', 'Account with this ID / Username already exists.');
    }
    if (userData.email && (await Accounts.findUserByEmail(userData.email))) {
      throw new Meteor.Error('email-exists', 'An account with this email already exists.');
    }

    return await Accounts.createUserAsync({
      username,
      email: userData.email || undefined,
      password: userData.password,
      profile: {
        fullName: userData.fullName || '',
        role: userData.role === 'teacher' ? 'teacher' : 'student',
        course: userData.course || '',
        section: userData.section || '',
        department: userData.department || '',
        gender: userData.gender || '',
        rank: userData.rank || '',
        rankLevel: userData.rankLevel || ''
      }
    });
  },

  // Used at login so students can't enter the teacher portal and vice versa
  async getMyRole() {
    if (!this.userId) throw new Meteor.Error('not-authorized', 'Not logged in.');
    const user = await Meteor.users.findOneAsync(this.userId, { fields: { profile: 1 } });
    return user?.profile?.role;
  }
});