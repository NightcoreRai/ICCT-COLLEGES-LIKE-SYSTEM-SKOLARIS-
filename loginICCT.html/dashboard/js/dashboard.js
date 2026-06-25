function showSection(sectionName) {
  const sections = document.querySelectorAll('[id$="-section"]');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  const selectedSection = document.getElementById(`${sectionName}-section`);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  event.target.closest('.nav-link').classList.add('active');
  document.querySelector('.main-content').scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', function() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  if (userData) {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = userData.name || 'User';

    const userInitialEl = document.getElementById('userInitial');
    if (userInitialEl) userInitialEl.textContent = (userData.name || 'U').charAt(0).toUpperCase();

    const welcomeNameEl = document.getElementById('welcomeName');
    if (welcomeNameEl) {
      welcomeNameEl.textContent = (userData.name || 'User').split(' ')[0];
    }

    // Populate profile fields
    if (document.getElementById('profileStudentId')) {
      document.getElementById('profileStudentId').value = userData.studentId || '';
      document.getElementById('profileFirstName').value = userData.firstName || userData.name.split(' ')[0] || '';
      document.getElementById('profileLastName').value = userData.lastName || userData.name.split(' ').slice(1).join(' ') || '';
      document.getElementById('profileEmail').value = userData.email || '';
      document.getElementById('profilePhone').value = userData.phone || '';
      document.getElementById('profileBirthDate').value = userData.birthDate || '';
      document.getElementById('profileGradeLevel').value = userData.gradeLevel || '';
      document.getElementById('profileEnrollDate').value = userData.enrollDate || '';
    }
  } else {
    window.location.href = '../Project/icctlogin.html';
  }

  loadDashboardData();

  if (document.getElementById('adminStudentsTableBody')) {
    renderAdminStudents();
  }
});

async function loadDashboardData() {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Dashboard loaded successfully');
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '../Project/icctlogin.html';
  }
}

function getStoredCredentials() {
  try {
    return JSON.parse(localStorage.getItem('validCredentials') || '{}');
  } catch (error) {
    return {};
  }
}

function saveStoredCredentials(credentials) {
  localStorage.setItem('validCredentials', JSON.stringify(credentials));
}

function togglePasswordChange() {
  const box = document.getElementById('passwordChangeBox');
  if (box) {
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
  }
}

function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const username = userData.studentId || userData.name;

  if (!username) {
    alert('No user is signed in.');
    return;
  }
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    alert('Please fill in all password fields.');
    return;
  }
  if (newPassword.length < 6) {
    alert('New password must be at least 6 characters long.');
    return;
  }
  if (newPassword !== confirmNewPassword) {
    alert('New passwords do not match.');
    return;
  }

  const storedCredentials = getStoredCredentials();
  const validCredentials = {
    'admin': 'admin123',
    'student': 'password123',
    'teacher': 'teacher456',
    'user': 'user789'
  };
  const credentials = { ...validCredentials, ...storedCredentials };

  if (!credentials[username]) {
    alert('Unable to find your account.');
    return;
  }
  if (credentials[username] !== currentPassword) {
    alert('Current password is incorrect.');
    return;
  }

  storedCredentials[username] = newPassword;
  saveStoredCredentials(storedCredentials);

  alert('Your password has been updated successfully.');
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmNewPassword').value = '';
  const box = document.getElementById('passwordChangeBox');
  if (box) box.style.display = 'none';
}

function updateProfileInfo() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (!userData || !userData.isLoggedIn) {
    alert('Unable to update profile. User not logged in.');
    return;
  }
  
  const firstName = document.getElementById('profileFirstName').value.trim();
  const lastName = document.getElementById('profileLastName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const birthDate = document.getElementById('profileBirthDate').value;

  if (!firstName || !lastName || !email) {
    alert('First name, last name, and email are required.');
    return;
  }

  const updatedUserData = {
    ...userData,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    birthDate
  };
  
  localStorage.setItem('userData', JSON.stringify(updatedUserData));
  
  // Update account details in userAccounts
  const accounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
  if (accounts[userData.studentId]) {
    accounts[userData.studentId] = {
      ...accounts[userData.studentId],
      firstName,
      lastName,
      email,
      phone,
      birthDate
    };
    localStorage.setItem('userAccounts', JSON.stringify(accounts));
  }
  
  document.getElementById('userName').textContent = updatedUserData.name || 'User';
  document.getElementById('userInitial').textContent = (updatedUserData.name || 'U').charAt(0).toUpperCase();
  document.getElementById('welcomeName').textContent = (updatedUserData.name || 'User').split(' ')[0];
  
  alert('Profile updated successfully!');
}

const API_BASE_URL = 'http://localhost:5000/api';

async function fetchFromAPI(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('authToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function getCurrentUser() {
  try {
    const data = await fetchFromAPI('/auth/me');
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

async function getStudentGrades(studentId) {
  try {
    const data = await fetchFromAPI(`/grades/student/${studentId}`);
    return data.grades;
  } catch (error) {
    console.error('Error fetching grades:', error);
    return [];
  }
}

async function getStudentCourses(studentId) {
  try {
    const data = await fetchFromAPI('/courses');
    return data.courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function getStudentAttendance(studentId) {
  try {
    const data = await fetchFromAPI(`/attendance/student/${studentId}`);
    return data.attendance;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

async function updateProfile(profileData) {
  try {
    const response = await fetchFromAPI('/auth/update-profile', 'PUT', profileData);
    alert('Profile updated successfully!');
    return response;
  } catch (error) {
    alert('Error updating profile');
    console.error(error);
  }
}
const searchInput = document.getElementById("menuSearch");
const suggestionBox = document.getElementById("suggestions");

if (searchInput && suggestionBox) {
  const menuItems = [
    "Dashboard",
    "Courses",
    "Grades",
    "Attendance",
    "Schedule",
    "Profile",
    "Pricing",
    "Notifications",
    "System Status",
    "Help Center"
  ];

  searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    suggestionBox.innerHTML = "";

    if(value === ""){
        suggestionBox.style.display = "none";
        return;
    }

    const matches = menuItems.filter(item =>
        item.toLowerCase().includes(value)
    );

    matches.forEach(item => {

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = item;

        div.onclick = () => {
            searchInput.value = item;
            suggestionBox.style.display = "none";
        };

        suggestionBox.appendChild(div);
    });

    suggestionBox.style.display =
        matches.length ? "block" : "none";
  });
}

// Admin Students Management Functions
function initializeDefaultStudents() {
  if (localStorage.getItem('initializedDefaults') === 'true') {
    return;
  }

  let storedAccounts = {};
  let storedCredentials = {};
  try {
    storedAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
    storedCredentials = JSON.parse(localStorage.getItem('validCredentials') || '{}');
  } catch (e) {
    console.error(e);
  }

  const defaultStudents = [
    { studentId: 'STU001', firstName: 'John', lastName: 'Doe', email: 'john@icct.edu', gradeLevel: 'Junior', status: 'Active' },
    { studentId: 'STU002', firstName: 'Jane', lastName: 'Smith', email: 'jane@icct.edu', gradeLevel: 'Senior', status: 'Active' },
    { studentId: 'STU003', firstName: 'Bob', lastName: 'Johnson', email: 'bob@icct.edu', gradeLevel: 'Sophomore', status: 'Active' }
  ];

  defaultStudents.forEach(student => {
    if (!storedAccounts[student.studentId]) {
      storedAccounts[student.studentId] = student;
    }
    if (!storedCredentials[student.studentId]) {
      storedCredentials[student.studentId] = 'password123';
    }
  });

  localStorage.setItem('userAccounts', JSON.stringify(storedAccounts));
  localStorage.setItem('validCredentials', JSON.stringify(storedCredentials));
  localStorage.setItem('initializedDefaults', 'true');
}

function renderAdminStudents() {
  const tableBody = document.getElementById('adminStudentsTableBody');
  if (!tableBody) return;

  // Ensure defaults are initialized in localStorage
  initializeDefaultStudents();

  // Clear existing rows
  tableBody.innerHTML = '';

  // Get all students from localStorage
  let storedAccounts = {};
  try {
    storedAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
  } catch (e) {
    console.error('Error reading userAccounts:', e);
  }

  const allStudents = Object.values(storedAccounts).map(acc => ({
    studentId: acc.studentId,
    name: `${acc.firstName} ${acc.lastName}`,
    email: acc.email,
    gradeLevel: acc.gradeLevel || '1st Year',
    status: acc.status || 'Active'
  }));

  // Populate table rows
  allStudents.forEach(student => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${student.studentId}</strong></td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.gradeLevel}</td>
      <td><span class="badge badge-success">${student.status}</span></td>
      <td>
        <button class="btn-secondary" onclick="editStudent('${student.studentId}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Edit</button>
        <button class="btn-secondary" onclick="deleteStudent('${student.studentId}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background-color: #e74c3c; color: white; border: none; margin-left: 0.5rem;">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Update total students count if the element exists
  const totalStudentsEl = document.getElementById('totalStudents');
  if (totalStudentsEl) {
    totalStudentsEl.textContent = allStudents.length.toLocaleString();
  }
}

window.adminAddStudent = function() {
  const studentIdVal = document.getElementById('addStudentId').value.trim();
  const firstNameVal = document.getElementById('addFirstName').value.trim();
  const lastNameVal = document.getElementById('addLastName').value.trim();
  const emailVal = document.getElementById('addEmail').value.trim();
  const gradeLevelVal = document.getElementById('addGradeLevel').value;
  const phoneVal = document.getElementById('addPhone').value.trim();

  if (!studentIdVal || !firstNameVal || !lastNameVal || !emailVal || !gradeLevelVal) {
    alert('Please fill in all required fields (Student ID, First/Last Name, Email, Grade Level).');
    return;
  }

  let storedAccounts = {};
  let storedCredentials = {};
  try {
    storedAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
    storedCredentials = JSON.parse(localStorage.getItem('validCredentials') || '{}');
  } catch (e) {
    console.error(e);
  }

  if (storedAccounts[studentIdVal] || storedCredentials[studentIdVal]) {
    alert('This Student ID is already registered.');
    return;
  }

  // Save the new student
  storedAccounts[studentIdVal] = {
    studentId: studentIdVal,
    firstName: firstNameVal,
    lastName: lastNameVal,
    email: emailVal,
    phone: phoneVal,
    birthDate: '',
    enrollDate: new Date().toISOString().split('T')[0],
    gradeLevel: gradeLevelVal,
    course: 'BSIT',
    status: 'Active'
  };
  storedCredentials[studentIdVal] = 'password123';

  localStorage.setItem('userAccounts', JSON.stringify(storedAccounts));
  localStorage.setItem('validCredentials', JSON.stringify(storedCredentials));

  alert('Student added successfully!');

  // Clear inputs
  document.getElementById('addStudentId').value = '';
  document.getElementById('addFirstName').value = '';
  document.getElementById('addLastName').value = '';
  document.getElementById('addEmail').value = '';
  document.getElementById('addGradeLevel').value = '';
  document.getElementById('addPhone').value = '';

  // Hide form
  toggleForm('addStudentForm');

  // Refresh list
  renderAdminStudents();
};

window.deleteStudent = function(studentId) {
  if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
    let storedAccounts = {};
    let storedCredentials = {};
    try {
      storedAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
      storedCredentials = JSON.parse(localStorage.getItem('validCredentials') || '{}');
    } catch (e) {
      console.error(e);
    }

    if (storedAccounts[studentId]) {
      delete storedAccounts[studentId];
      delete storedCredentials[studentId];
      localStorage.setItem('userAccounts', JSON.stringify(storedAccounts));
      localStorage.setItem('validCredentials', JSON.stringify(storedCredentials));
      alert('Student deleted successfully!');
      renderAdminStudents();
    }
  }
};

window.editStudent = function(studentId) {
  let storedAccounts = {};
  try {
    storedAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
  } catch (e) {
    console.error(e);
  }

  const student = storedAccounts[studentId];
  if (!student) {
    alert('Student not found.');
    return;
  }

  const newFirstName = prompt('Enter new First Name:', student.firstName);
  if (newFirstName === null) return;
  const newLastName = prompt('Enter new Last Name:', student.lastName);
  if (newLastName === null) return;
  const newEmail = prompt('Enter new Email:', student.email);
  if (newEmail === null) return;
  const newGrade = prompt('Enter new Year/Grade Level:', student.gradeLevel);
  if (newGrade === null) return;

  student.firstName = newFirstName.trim();
  student.lastName = newLastName.trim();
  student.email = newEmail.trim();
  student.gradeLevel = newGrade.trim();

  storedAccounts[studentId] = student;
  localStorage.setItem('userAccounts', JSON.stringify(storedAccounts));
  alert('Student updated successfully!');
  renderAdminStudents();
};
 
// ============================================
    // HAMBURGER MENU
    // ============================================
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
      if (hamburger) hamburger.classList.toggle('active');
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    }

    if (hamburger) hamburger.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    // Close sidebar when a link is clicked (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 992) {
          if (hamburger) hamburger.classList.remove('active');
          if (sidebar) sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('active');
        }
      });
    });

    // ============================================
    // SHOP FUNCTIONALITY
    // ============================================
    
    const shopItems = [
      { id: 1, name: 'CCS Uniform (F/M)', img: '../pictures/CCS Uniform.png', price: 800, desc: 'Official CCS department uniform for male and female students.' },
      { id: 2, name: 'CCS Vest (F/M)',  img: '../pictures/CCS Vest.jpg', price: 420, desc: 'Official College of Computer Studies knitted vest.' },
      { id: 3, name: 'NSTP T-shirt (old)', img: '../pictures/NSTP old.jpg', price: 230, desc: 'NSTP department shirt (previous design).' },
      { id: 4, name: 'NSTP T-shirt (new)', img: '../pictures/nstp shirt new.jpg', price: 180, desc: 'Official new design NSTP department shirt.' },
      { id: 5, name: 'PE Pants Jogger (Unisex)',  img: '../pictures/PE Jogger.jpg', price: 300, desc: 'Unisex physical education jogging pants.' },
      { id: 6, name: 'PE T-Shirt (Unisex)',  img: '../pictures/PE T-shirt.jpg', price: 180, desc: 'Comfortable unisex physical education t-shirt.' },
      { id: 7, name: 'School Id Set',  img: '../pictures/School Id lace.jpg', price: 80, desc: 'Official ICCT Colleges ID card holder and lanyard set.' }
    ];

    let cart = [];

    function renderShop() {
      const grid = document.getElementById('shopGrid');
      if (!grid) return;
      
      grid.innerHTML = '';
      
      shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
          <div class="shop-item-image">
            <img src="${item.img}" alt="${item.name}" loading="lazy">
          </div>
          <div class="shop-item-info">
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">₱${item.price.toFixed(2)}</div>
            <button class="shop-add-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
              <i class="fas fa-plus-circle"></i> Add to Cart
            </button>
          </div>
        `;
        grid.appendChild(div);
      });

      document.querySelectorAll('.shop-add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const name = this.getAttribute('data-name');
          const price = parseFloat(this.getAttribute('data-price'));
          addToCart(name, price, this);
        });
      });
    }

    function addToCart(name, price, button) {
      cart.push({ name, price });
      updateCartUI();
      
      if (button) {
        button.innerHTML = '<i class="fas fa-check"></i> Added';
        button.classList.add('added');
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-plus-circle"></i> Add to Cart';
          button.classList.remove('added');
        }, 800);
      }
    }

    function updateCartUI() {
      const list = document.getElementById('cartItemsList');
      const counter = document.getElementById('shopCartCounter');
      const totalEl = document.getElementById('cartTotal');
      const mainCounter = document.getElementById('cartCounter');
      
      if (!list) return;
      
      if (cart.length === 0) {
        list.innerHTML = '<span class="empty-cart">Your cart is empty</span>';
        if (counter) counter.textContent = '0';
        if (totalEl) totalEl.textContent = '0.00';
        if (mainCounter) mainCounter.textContent = '0';
        return;
      }
      
      list.innerHTML = '';
      cart.forEach((item, index) => {
        const span = document.createElement('span');
        span.className = 'cart-item';
        span.innerHTML = `
          ${item.name} ₱${item.price.toFixed(2)}
          <button class="cart-item-remove" data-index="${index}">
            <i class="fas fa-times-circle"></i>
          </button>
        `;
        list.appendChild(span);
      });
      
      document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          cart.splice(idx, 1);
          updateCartUI();
        });
      });
      
      const total = cart.reduce((sum, i) => sum + i.price, 0);
      if (counter) counter.textContent = cart.length;
      if (totalEl) totalEl.textContent = total.toFixed(2);
      if (mainCounter) mainCounter.textContent = cart.length;
    }

    function clearCart() {
      cart = [];
      updateCartUI();
    }

    // ============================================
    // GCASH PAYMENT
    // ============================================
    function openGcashModal() {
      if (cart.length === 0) {
        alert('Your cart is empty! Please add items before checking out.');
        return;
      }
      
      const total = cart.reduce((sum, i) => sum + i.price, 0);
      document.getElementById('modalTotal').textContent = `₱${total.toFixed(2)}`;
      document.getElementById('modalItemCount').textContent = cart.length;
      document.getElementById('referenceNumber').value = '';
      document.getElementById('paymentMessage').style.display = 'none';
      document.getElementById('gcashModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeGcashModal() {
      document.getElementById('gcashModal').classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    function confirmPayment() {
      const refNum = document.getElementById('referenceNumber').value.trim();
      const messageEl = document.getElementById('paymentMessage');
      
      if (!refNum) {
        messageEl.style.display = 'block';
        messageEl.className = 'alert alert-danger';
        messageEl.textContent = 'Please enter your GCash reference number.';
        return;
      }
      
      if (refNum.length < 10) {
        messageEl.style.display = 'block';
        messageEl.className = 'alert alert-warning';
        messageEl.textContent = 'Please enter a valid reference number (at least 10 characters).';
        return;
      }

      // Payment successful
      const total = cart.reduce((sum, i) => sum + i.price, 0);
      messageEl.style.display = 'block';
      messageEl.className = 'alert alert-success';
      messageEl.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Payment of <strong>₱${total.toFixed(2)}</strong> confirmed!<br>
        Reference #: <strong>${refNum}</strong><br>
        Thank you for your purchase!
      `;

      // Clear cart after successful payment
      setTimeout(() => {
        cart = [];
        updateCartUI();
        setTimeout(() => {
          closeGcashModal();
        }, 2000);
      }, 1500);
    }

    // Close modal on outside click
    document.getElementById('gcashModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeGcashModal();
      }
    });

    // ============================================
    // DASHBOARD FUNCTIONS
    // ============================================

    function showSection(sectionName) {
      const sections = document.querySelectorAll('[id$="-section"]');
      sections.forEach(section => {
        section.style.display = 'none';
      });

      const selectedSection = document.getElementById(`${sectionName}-section`);
      if (selectedSection) {
        selectedSection.style.display = 'block';
      }

      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.classList.remove('active');
      });

      const clickedLink = document.querySelector(`.nav-link[href="#${sectionName}"]`);
      if (clickedLink) {
        clickedLink.classList.add('active');
      }
      
      document.querySelector('.main-content').scrollTop = 0;
    }

    document.addEventListener('DOMContentLoaded', function() {
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (userData) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = userData.name || 'User';

        const userInitialEl = document.getElementById('userInitial');
        if (userInitialEl) userInitialEl.textContent = (userData.name || 'U').charAt(0).toUpperCase();

        const welcomeNameEl = document.getElementById('welcomeName');
        if (welcomeNameEl) {
          welcomeNameEl.textContent = (userData.name || 'User').split(' ')[0];
        }
      }

      renderShop();
      updateCartUI();
      
      const clearCartBtn = document.getElementById('clearCartBtn');
      if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

      const checkoutBtn = document.getElementById('checkoutBtn');
      if (checkoutBtn) checkoutBtn.addEventListener('click', openGcashModal);
    });

    function logout() {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '../Project/icctlogin.html';
      }
    }

    function getStoredCredentials() {
      try {
        return JSON.parse(localStorage.getItem('validCredentials') || '{}');
      } catch (error) {
        return {};
      }
    }

    function saveStoredCredentials(credentials) {
      localStorage.setItem('validCredentials', JSON.stringify(credentials));
    }

    function togglePasswordChange() {
      const box = document.getElementById('passwordChangeBox');
      if (box) {
        box.style.display = box.style.display === 'block' ? 'none' : 'block';
      }
    }

    function changePassword() {
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = userData.studentId || userData.name;

      if (!username) {
        alert('No user is signed in.');
        return;
      }
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Please fill in all password fields.');
        return;
      }
      if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match.');
        return;
      }

      const storedCredentials = getStoredCredentials();
      const validCredentials = {
        'admin': 'admin123',
        'student': 'password123',
        'teacher': 'teacher456',
        'user': 'user789'
      };
      const credentials = { ...validCredentials, ...storedCredentials };

      if (!credentials[username]) {
        alert('Unable to find your account. Please log out and log in again.');
        return;
      }
      if (credentials[username] !== currentPassword) {
        alert('Current password is incorrect.');
        return;
      }

      storedCredentials[username] = newPassword;
      saveStoredCredentials(storedCredentials);

      alert('Your password has been updated successfully.');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
      const box = document.getElementById('passwordChangeBox');
      if (box) box.style.display = 'none';
    }

    function updateProfileInfo() {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (!userData || !userData.isLoggedIn) {
        alert('Unable to update profile. User not logged in.');
        return;
      }

      const firstName = document.getElementById('profileFirstName').value.trim();
      const lastName = document.getElementById('profileLastName').value.trim();
      const email = document.getElementById('profileEmail').value.trim();
      const phone = document.getElementById('profilePhone').value.trim();
      const birthDate = document.getElementById('profileBirthDate').value;

      if (!firstName || !lastName || !email) {
        alert('First name, last name, and email are required.');
        return;
      }

      const updatedUserData = {
        ...userData,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        birthDate
      };

      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      const accounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
      if (accounts[userData.studentId]) {
        accounts[userData.studentId] = { ...accounts[userData.studentId], firstName, lastName, email, phone, birthDate };
        localStorage.setItem('userAccounts', JSON.stringify(accounts));
      }

      document.getElementById('userName').textContent = updatedUserData.name || 'User';
      document.getElementById('userInitial').textContent = (updatedUserData.name || 'U').charAt(0).toUpperCase();
      document.getElementById('welcomeName').textContent = (updatedUserData.name || 'User').split(' ')[0];
      alert('Profile updated successfully!');
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeGcashModal();
      }
    });