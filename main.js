
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import './index.html';
import './style.css';
// login 
import './templates/student/slogin.html';
import './statics/Spart/slogin..css';
import './templates/teacher/login.html';
import './statics/tpart/login.css';
// student registration template
import './templates/student/sreg.html';
// teacher registration template
import './templates/teacher/reg.html';
// forgot choice template
import './forgotChoice.html';
 
// student dashboard
import './templates/student/Dashboard/sdashboard.html';


// TODO: import JoinTab, MyAssignmentsTab and MyProgressTab here once those files exist
import './statics/Spart/sdashboard.css';
 
// teacher dashboard
import './templates/teacher/tdashboard/tdashboard.html';
 
// Track ang current page view
const currentView = new ReactiveVar('home');
const regStep = new ReactiveVar(1);
const regError = new ReactiveVar('');
 
const teacherRegStep = new ReactiveVar(1);
const teacherRegError = new ReactiveVar('');
 
// Reactive variables para sa choice screen at alerts
const choiceMsg = new ReactiveVar('');
const choiceStatus = new ReactiveVar(''); // 'success' o 'error'
const emailSentState = new ReactiveVar(false);
 
const studentLoginError = new ReactiveVar('');
const teacherLoginError = new ReactiveVar('');
const activeTab = new ReactiveVar('overview');
 
// Pansamantalang pag-iimbak ng data kada step
const tempStudentData = {
  fullName: '',
  schoolId: '',
  email: '',
  course: '',
  section: ''
};
 
const tempTeacherData = {
  fullName: '',
  email: '',
  gender: '',
  rank: '',
  rankLevel: '',
  department: ''
};
 
function goToDashboard(role) {
  activeTab.set('overview');
  currentView.set(role === 'teacher' ? 'teacherDashboard' : 'studentDashboard');
}
 
// Shared login: only existing accounts get in, and the role must match the portal
function loginWithRole(username, password, role, errorVar) {
  errorVar.set('');
  Meteor.loginWithPassword(username, password, (err) => {
    if (err) {
      errorVar.set(
        err.error === 403
          ? 'No matching account found, or wrong password. Please register first if you are new.'
          : (err.reason || 'Login failed.')
      );
      return;
    }
    Meteor.call('getMyRole', (e, actualRole) => {
      if (e || actualRole !== role) {
        Meteor.logout();
        errorVar.set(`This is not a ${role} account. Please use the correct portal.`);
        return;
      }
      goToDashboard(role);
    });
  });
}
 
// Already logged in (e.g. page refresh) -> go straight to the right dashboard
Tracker.autorun(() => {
  const user = Meteor.user();
  if (user && user.profile && currentView.get() === 'home') {
    goToDashboard(user.profile.role);
  }
});
 
// ---------------------------------------------------------------
// Forgot password choice
// ---------------------------------------------------------------
Template.ForgotChoice.helpers({
  choiceMessage() {
    return choiceMsg.get();
  },
  emailSentAlready() {
    return emailSentState.get();
  },
  alertBgColor() {
    return choiceStatus.get() === 'error' ? '#fee2e2' : '#dcfce7';
  },
  alertTextColor() {
    return choiceStatus.get() === 'error' ? '#991b1b' : '#166534';
  },
  alertBorderColor() {
    return choiceStatus.get() === 'error' ? '#fecaca' : '#bbf7d0';
  },
  alertIcon() {
    return choiceStatus.get() === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
  }
});
 
Template.ForgotChoice.events({
  'click #backToLoginFromChoice'(event) {
    event.preventDefault();
    choiceMsg.set('');
    choiceStatus.set('');
    emailSentState.set(false);
    currentView.set('studentLogin');
  },
 
  'click #btnSendPasswordOption'(event) {
    event.preventDefault();
    choiceMsg.set('Checking account and sending email...');
 
    // Tawagin ang server method (ipasa ang role at identifier)
    Meteor.call('sendPasswordAutomatically', 'student', 'registered_user', (error, result) => {
      if (error) {
        choiceStatus.set('error');
        choiceMsg.set(error.reason || 'No account found for this user.');
        emailSentState.set(false);
      } else {
        choiceStatus.set('success');
        choiceMsg.set(result.message);
        emailSentState.set(true);
      }
    });
  }
});
 
// Helper para sa equality check sa Spacebars templates
Template.registerHelper('eq', function (a, b) {
  return a === b;
});
 
// ---------------------------------------------------------------
// Body (page switching)
// ---------------------------------------------------------------
Template.body.helpers({
  isHome() {
    return currentView.get() === 'home';
  },
  isStudentLogin() {
    return currentView.get() === 'studentLogin';
  },
  isTeacherLogin() {
    return currentView.get() === 'teacherLogin';
  },
  isStudentRegister() {
    return currentView.get() === 'studentRegister';
  },
  isTeacherRegister() {
    return currentView.get() === 'teacherRegister';
  },
  isForgotChoice() {
    return currentView.get() === 'forgotChoice';
  },
  isStudentDashboard() {
    return currentView.get() === 'studentDashboard';
  },
  isTeacherDashboard() {
    return currentView.get() === 'teacherDashboard';
  }
});
 
Template.body.events({
  'click .btn-login-nav, click .student-card'(event) {
    event.preventDefault();
    const roleModal = document.getElementById('roleModal');
    if (roleModal) roleModal.classList.add('hidden');
    studentLoginError.set('');
    currentView.set('studentLogin');
  },
 
  'click .teacher-card'(event) {
    event.preventDefault();
    const roleModal = document.getElementById('roleModal');
    if (roleModal) roleModal.classList.add('hidden');
    teacherLoginError.set('');
    currentView.set('teacherLogin');
  },
 
  'click #backToHome, click #backToHomeTeacher'(event) {
    event.preventDefault();
    currentView.set('home');
  },
 
  'click #switchToStudent'(event) {
    event.preventDefault();
    studentLoginError.set('');
    currentView.set('studentLogin');
  },
  'click #switchToTeacher'(event) {
    event.preventDefault();
    teacherLoginError.set('');
    currentView.set('teacherLogin');
  },
 
  'click #signInPortalBtn'() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) roleModal.classList.remove('hidden');
  },
 
  'click #closeRoleModal'() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) roleModal.classList.add('hidden');
  },
 
  'click #roleModal'(event) {
    const roleModal = document.getElementById('roleModal');
    if (event.target === roleModal) {
      roleModal.classList.add('hidden');
    }
  },
 
  'click #createAccountBtn'(event) {
    event.preventDefault();
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.classList.remove('hidden');
  },
 
  'click #closeRegisterModal'() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.classList.add('hidden');
  },
 
  'click #registerModal'(event) {
    const registerModal = document.getElementById('registerModal');
    if (event.target === registerModal) {
      registerModal.classList.add('hidden');
    }
  },
 
  'click #studentRegisterCard'(event) {
    event.preventDefault();
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.classList.add('hidden');
    regError.set('');
    regStep.set(1);
    currentView.set('studentRegister');
  },
 
  'click #teacherRegisterCard'(event) {
    event.preventDefault();
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.classList.add('hidden');
    teacherRegError.set('');
    teacherRegStep.set(1);
    currentView.set('teacherRegister');
  }
});
 
// ---------------------------------------------------------------
// Student Dashboard
// ---------------------------------------------------------------
Template.StudentDashboard.helpers({
  studentData() {
    const user = Meteor.user();
    if (user && user.profile) {
      return {
        name: user.profile.fullName,
        course: user.profile.course || 'CPE Student'
      };
    }
    return { name: 'Student', course: 'CPE Student' };
  },
  isTab(name) {
    return activeTab.get() === name;
  }
});
 
Template.StudentDashboard.events({
  'click #tabOverview'(e)    { e.preventDefault(); activeTab.set('overview'); },
  'click #tabJoin'(e)        { e.preventDefault(); activeTab.set('join'); },
  'click #tabAssignments'(e) { e.preventDefault(); activeTab.set('myassignments'); },
  'click #tabProgress'(e)    { e.preventDefault(); activeTab.set('myprogress'); },
  'click #btnLogoutStudent'(e) {
    e.preventDefault();
    Meteor.logout(() => currentView.set('home'));
  }
});
 
// ---------------------------------------------------------------
// Teacher Dashboard
// ---------------------------------------------------------------
Template.TeacherDashboard.helpers({
  teacherName() {
    const user = Meteor.user();
    return user?.profile?.fullName || 'Teacher';
  },
  teacherDept() {
    const user = Meteor.user();
    return user?.profile?.department || '';
  }
});
 
Template.TeacherDashboard.events({
  'click #btnLogoutTeacher'(e) {
    e.preventDefault();
    Meteor.logout(() => currentView.set('home'));
  }
});
 
// ---------------------------------------------------------------
// Student Login
// ---------------------------------------------------------------
Template.StudentLogin.helpers({
  loginError() {
    return studentLoginError.get();
  }
});
 
Template.StudentLogin.events({
  'click #togglePassword'() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('togglePassword');
 
    if (passwordInput) {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      if (eyeIcon) {
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
      }
    }
  },
  'submit #studentLoginForm'(event) {
    event.preventDefault();
    const schoolId = event.target.schoolId.value.trim();
    const password = event.target.password.value;
    loginWithRole(schoolId, password, 'student', studentLoginError);
  },
  'click #goToStudentRegister'(event) {
    event.preventDefault();
    regError.set('');
    regStep.set(1);
    currentView.set('studentRegister');
  },
  // Pagpindot ng "Forgot password?" sa student login para pumunta sa choice view
  'click .forgot-pwd-link'(event) {
    event.preventDefault();
    choiceMsg.set('');
    currentView.set('forgotChoice');
  }
});
 
// ---------------------------------------------------------------
// Teacher Login
// ---------------------------------------------------------------
Template.TeacherLogin.helpers({
  loginError() {
    return teacherLoginError.get();
  }
});
 
Template.TeacherLogin.events({
  'click #toggleTeacherPassword'() {
    const passwordInput = document.getElementById('teacherPassword');
    const eyeIcon = document.getElementById('toggleTeacherPassword');
 
    if (passwordInput) {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      if (eyeIcon) {
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
      }
    }
  },
  'submit #teacherLoginForm'(event) {
    event.preventDefault();
    const fullName = event.target.fullName.value.trim();
    const password = event.target.teacherPassword.value;
    loginWithRole(fullName, password, 'teacher', teacherLoginError);
  },
  'click #goToTeacherRegister'(event) {
    event.preventDefault();
    teacherRegError.set('');
    teacherRegStep.set(1);
    currentView.set('teacherRegister');
  },
  // Pagpindot ng "Forgot password?" sa teacher login para pumunta sa choice view
  'click .forgot-pwd-link'(event) {
    event.preventDefault();
    choiceMsg.set('');
    currentView.set('forgotChoice');
  }
});
 
// ---------------------------------------------------------------
// Student Registration
// ---------------------------------------------------------------
Template.StudentRegister.helpers({
  regStepNum() {
    return regStep.get();
  },
  isStep(stepNumber) {
    return regStep.get() === stepNumber;
  },
  stepDescription() {
    const s = regStep.get();
    if (s === 1) return "Please enter your full name.";
    if (s === 2) return "Enter your School ID and Email Address.";
    if (s === 3) return "Provide your course and section.";
    if (s === 4) return "Set your secure password.";
    return "";
  },
  errorMessage() {
    return regError.get();
  }
});
 
Template.StudentRegister.events({
  'click #nextStepBtn'(event) {
    event.preventDefault();
    regError.set('');
    const current = regStep.get();
 
    if (current === 1) {
      const fullName = document.getElementById('regFullName').value.trim();
      if (!fullName || fullName.length < 3) {
        regError.set('Full name must be at least 3 characters long.');
        return;
      }
      tempStudentData.fullName = fullName;
    }
 
    if (current === 2) {
      const schoolId = document.getElementById('regSchoolId').value.trim();
      const email = document.getElementById('regEmail').value.trim();
 
      if (!schoolId || !email) {
        regError.set('Both School ID and Email Address are required.');
        return;
      }
 
      const schoolIdRegex = /^\d{2}-\d{5}$/;
      if (!schoolIdRegex.test(schoolId)) {
        regError.set('School ID format must be ##-##### using numbers only (e.g., 20-12345).');
        return;
      }
 
      if (!email.includes('@') || !email.includes('.')) {
        regError.set('Please enter a valid email address.');
        return;
      }
 
      tempStudentData.schoolId = schoolId;
      tempStudentData.email = email;
    }
 
    if (current === 3) {
      const course = document.getElementById('regCourse').value.trim();
      const section = document.getElementById('regSection').value.trim();
 
      if (!course || !section) {
        regError.set('Both Course and Section are required.');
        return;
      }
 
      tempStudentData.course = course;
      tempStudentData.section = section;
    }
 
    if (current < 4) {
      regStep.set(current + 1);
    }
  },
 
  'click #prevStepBtn'(event) {
    event.preventDefault();
    regError.set('');
    const current = regStep.get();
    if (current > 1) {
      regStep.set(current - 1);
    }
  },
 
  'click #backToHomeFromReg, click #switchToLogin, click #goToLoginFromCta'(event) {
    event.preventDefault();
    regError.set('');
    regStep.set(1);
    studentLoginError.set('');
    currentView.set('studentLogin');
  },
 
  'submit #studentRegisterForm'(event) {
    event.preventDefault();
    regError.set('');
 
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
 
    if (!password || !confirmPassword) {
      regError.set('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      regError.set('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      regError.set('Passwords do not match. Please check again.');
      return;
    }
 
    const userData = {
      username: tempStudentData.schoolId,
      email: tempStudentData.email,
      password: password,
      fullName: tempStudentData.fullName,
      role: 'student',
      course: tempStudentData.course || 'CPE Student',
      section: tempStudentData.section
    };
 
    // Server method: saves permanently to MongoDB
    Meteor.call('registerUser', userData, (error) => {
      if (error) {
        regError.set(error.reason || 'Registration failed.');
        return;
      }
      // Registered -> log in right away and go to the Student Dashboard
      Meteor.loginWithPassword(userData.username, password, (err) => {
        if (err) {
          regError.set(err.reason || 'Registered, but automatic login failed. Please sign in.');
        } else {
          regError.set('');
          regStep.set(1);
          goToDashboard('student');
        }
      });
    });
  }
});
 
// ---------------------------------------------------------------
// Teacher Registration
// ---------------------------------------------------------------
Template.TeacherRegister.helpers({
  teacherRegStepNum() {
    return teacherRegStep.get();
  },
  isTeacherStep(stepNumber) {
    return teacherRegStep.get() === stepNumber;
  },
  teacherStepDescription() {
    const s = teacherRegStep.get();
    if (s === 1) return "Please enter your full name, faculty email, and gender.";
    if (s === 2) return "Select your academic rank, level, and department.";
    if (s === 3) return "Set your secure password.";
    return "";
  },
  teacherErrorMessage() {
    return teacherRegError.get();
  }
});
 
Template.TeacherRegister.events({
  'click #teacherNextStepBtn'(event) {
    event.preventDefault();
    teacherRegError.set('');
    const current = teacherRegStep.get();
 
    if (current === 1) {
      const fullName = document.getElementById('regTeacherFullName').value.trim();
      const email = document.getElementById('regTeacherEmail').value.trim();
      const gender = document.getElementById('regTeacherGender').value;
 
      if (!fullName || !email || !gender) {
        teacherRegError.set('Please fill in all fields (Full Name, Email, and Gender).');
        return;
      }
      if (fullName.length < 3) {
        teacherRegError.set('Full name must be at least 3 characters long.');
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        teacherRegError.set('Please enter a valid faculty email address.');
        return;
      }
 
      Object.assign(tempTeacherData, { fullName, email, gender });
    }
 
    if (current === 2) {
      const rank = document.getElementById('regTeacherRank').value;
      const rankLevel = document.getElementById('regTeacherRankLevel').value;
      const department = document.getElementById('regTeacherDepartment').value.trim();
 
      if (!rank || !rankLevel || !department) {
        teacherRegError.set('Please select Academic Rank, Level, and enter your Department.');
        return;
      }
 
      Object.assign(tempTeacherData, { rank, rankLevel, department });
    }
 
    if (current < 3) {
      teacherRegStep.set(current + 1);
    }
  },
 
  'click #teacherPrevStepBtn'(event) {
    event.preventDefault();
    teacherRegError.set('');
    const current = teacherRegStep.get();
    if (current > 1) {
      teacherRegStep.set(current - 1);
    }
  },
 
  'click #backToHomeFromTeacherReg, click #switchToTeacherLogin, click #goToTeacherLoginFromCta'(event) {
    event.preventDefault();
    teacherRegError.set('');
    teacherRegStep.set(1);
    teacherLoginError.set('');
    currentView.set('teacherLogin');
  },
 
  'submit #teacherRegisterForm'(event) {
    event.preventDefault();
    teacherRegError.set('');
 
    const password = document.getElementById('regTeacherPassword').value;
    const confirmPassword = document.getElementById('regTeacherConfirmPassword').value;
 
    if (!password || !confirmPassword) {
      teacherRegError.set('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      teacherRegError.set('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      teacherRegError.set('Passwords do not match. Please check again.');
      return;
    }
 
    const userData = {
      username: tempTeacherData.fullName, // teacher login uses Full Name
      email: tempTeacherData.email,
      password: password,
      fullName: tempTeacherData.fullName,
      role: 'teacher',
      gender: tempTeacherData.gender,
      rank: tempTeacherData.rank,
      rankLevel: tempTeacherData.rankLevel,
      department: tempTeacherData.department
    };
 
    Meteor.call('registerUser', userData, (error) => {
      if (error) {
        teacherRegError.set(error.reason || 'Registration failed.');
        return;
      }
      // Registered -> log in right away and go to the Teacher Dashboard
      Meteor.loginWithPassword(userData.username, password, (err) => {
        if (err) {
          teacherRegError.set(err.reason || 'Registered, but automatic login failed. Please sign in.');
        } else {
          teacherRegError.set('');
          teacherRegStep.set(1);
          goToDashboard('teacher');
        }
      });
    });
  }
});
 
