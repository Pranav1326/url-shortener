let token = sessionStorage.getItem('authToken') || null;

const saveToken = (newToken) => {
  token = newToken;
  sessionStorage.setItem('authToken', newToken);
}

const clearToken = () => {
  token = null;
  sessionStorage.removeItem('authToken');
}

// get headers with token if available
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Tab switching functionality
const showTab = (tabName) => {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
  
  if (tabName === 'myurls') {
    loadUserUrls();
  }
}

const shorten = () => {
  const url = document.getElementById('urlInput').value;
  const resultElement = document.getElementById('result');
  const copyButton = document.getElementById('copyButton');

  // handle empty url
  if (!url.trim()) {
    resultElement.innerText = 'Error: URL cannot be empty';
    resultElement.className = 'error';
    return;
  }

  // check url format
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/;
  if (!urlPattern.test(url)) {
    resultElement.innerText = 'Error: Invalid URL format use proper format(eg. https://example.com)';
    resultElement.className = 'error';
    return;
  }

  copyButton.style.display = 'none';
  resultElement.innerText = '';
  resultElement.className = '';

  fetch('/shorten', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ url })
  })
    .then(async res => {
      if (!res.ok) {
        return res.json().then(errorData => {
          throw new Error(errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }).catch(() => {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        });
      }
      return res.json();
    })
    .then(async data => {
      if (data.shortUrl) {
        resultElement.innerText = `Short URL: ${data.shortUrl}`;
        copyButton.style.display = 'inline-block';
        copyButton.dataset.url = data.shortUrl;
      } else {
        resultElement.innerText = data.message || data.error || 'Error: Could not shorten URL';
        resultElement.className = 'error';
      }
    })
    .catch(error => {
      console.error('Shorten URL error:', error);
      resultElement.innerText = error.message || 'Error: Something went wrong';
      resultElement.className = 'error';
    });
}

// copy to clipboard
const copyToClipboard = () => {
  const copyButton = document.getElementById('copyButton');
  const shortUrl = copyButton.dataset.url;

  if (shortUrl) {
    navigator.clipboard.writeText(shortUrl).then(() => {
      const originalText = copyButton.innerText;
      copyButton.innerText = 'Copied!';
      copyButton.style.background = '#38a169';
      setTimeout(() => {
        copyButton.innerText = originalText;
        copyButton.style.background = '#48bb78';
      }, 2000);
    }).catch(err => {
      const originalText = copyButton.innerText;
      copyButton.innerText = 'Copied!';
      copyButton.style.background = '#38a169';
      setTimeout(() => {
        copyButton.innerText = originalText;
        copyButton.style.background = '#48bb78';
      }, 2000);
    });
  }
}

// register
const registerUser = () => {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const resultElement = document.getElementById('registerResult');
  
  // Clear previous result
  resultElement.innerText = '';
  resultElement.className = 'auth-result';
  
  // Validation
  if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
    resultElement.innerText = 'All fields are required';
    resultElement.className = 'auth-result error';
    return;
  }
  
  if (password !== confirmPassword) {
    resultElement.innerText = 'Passwords do not match';
    resultElement.className = 'auth-result error';
    return;
  }
  
  if (password.length < 6) {
    resultElement.innerText = 'Password must be at least 6 characters';
    resultElement.className = 'auth-result error';
    return;
  }
  
  fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(async res => {
    if (!res.ok) {
      return res.json().then(errorData => {
        throw new Error(errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      });
    }
    return res.json();
  })
  .then(async data => {
    if (data.token) {
      saveToken(data.token);
      resultElement.innerText = 'Registration successful! You are now logged in.';
      resultElement.className = 'auth-result success';
      document.getElementById('registerEmail').value = '';
      document.getElementById('registerPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      
      setTimeout(() => {
        showTabByName('shorten');
      }, 2000);
    } else {
      resultElement.innerText = data.message || data.error || 'Registration failed';
      resultElement.className = 'auth-result error';
    }
  })
  .catch(error => {
    console.error('Registration error:', error);
    resultElement.innerText = error.message || 'Network error. Please try again.';
    resultElement.className = 'auth-result error';
  });
}

// login
const loginUser = () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const resultElement = document.getElementById('loginResult');
  resultElement.innerText = '';
  resultElement.className = 'auth-result';
  if (!email.trim() || !password.trim()) {
    resultElement.innerText = 'Email and password are required';
    resultElement.className = 'auth-result error';
    return;
  }
  
  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(async res => {
    if (!res.ok) {
      return res.json().then(errorData => {
        throw new Error(errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }).catch(() => {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      });
    }
    return res.json();
  })
  .then(async data => {
    if (data.token) {
      saveToken(data.token);
      resultElement.innerText = 'Login successful! Welcome back.';
      resultElement.className = 'auth-result success';
      
      // form clear
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
      
      setTimeout(() => {
        showTabByName('shorten');
      }, 2000);
    } else {
      resultElement.innerText = data.message || data.error || 'Invalid credentials';
      resultElement.className = 'auth-result error';
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    if(error === 'Error: HTTP 401: Unauthorized'){
      resultElement.innerText = 'Invalid email or password';
    }
    resultElement.innerText = error.message || 'Network error. Please try again.';
    resultElement.className = 'auth-result error';
  });
}

function showTabByName(tabName) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(tabName).classList.add('active');
  
  const targetButton = Array.from(tabButtons).find(btn => 
    btn.textContent.toLowerCase().includes(tabName === 'shorten' ? 'shorten' : tabName)
  );
  if (targetButton) {
    targetButton.classList.add('active');
  }
}

// to check if user is logged in
const isLoggedIn = () => {
  return token !== null;
}

// to update UI based on authentication status
const updateAuthUI = () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const shortenTab = document.getElementById('shorten');
  
  if (isLoggedIn()) {
    updateUserStatus('Logged in');
  } else {
    updateUserStatus('Not logged in');
  }
}

// fetch user urls
const loadUserUrls = () => {
  const urlsMessage = document.getElementById('urlsMessage');
  const urlsList = document.getElementById('urlsList');
  
  if (!isLoggedIn()) {
    urlsMessage.innerText = 'Please log in to view your URLs';
    urlsList.innerHTML = '';
    return;
  }
  urlsMessage.innerText = 'Loading your URLs...';
  urlsList.innerHTML = '';
  
  fetch('/user-urls', {
    method: 'GET',
    headers: getAuthHeaders()
  })
  .then(async res => {
    if (!res.ok) {
      return res.json().then(errorData => {
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }).catch(() => {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      });
    }
    return res.json();
  })
  .then(async urls => {
    urlsMessage.innerText = '';
    
    if (urls.length === 0) {
      urlsList.innerHTML = `
        <div class="empty-state">
          <div>📝</div>
          <h3>No URLs yet</h3>
          <p>Start by shortening some URLs in the "Shorten URL" tab!</p>
        </div>
      `;
      return;
    }
    
    // Display urls
    urlsList.innerHTML = urls.map(url => `
      <div class="url-item">
        <div class="url-original">Original: ${url.url}</div>
        <div class="url-short">Short: http://localhost:${window.location.port || 3000}/r/${url.code}</div>
        <div class="url-actions">
          <button class="url-copy-btn" onclick="copyUrlToClipboard('http://localhost:${window.location.port || 3000}/r/${url.code}')">
            Copy Short URL
          </button>
          <button class="url-copy-btn" onclick="openUrl('http://localhost:${window.location.port || 3000}/r/${url.code}')" style="background: #4299e1;">
            Visit
          </button>
          <div class="url-date">Created: ${new Date(url.created_at || Date.now()).toLocaleDateString()}</div>
        </div>
      </div>
    `).join('');
  })
  .catch(error => {
    console.error('Error loading URLs:', error);
    urlsMessage.innerText = error.message || 'Error loading URLs. Please try again.';
    urlsList.innerHTML = '';
  });
}

const copyUrlToClipboard = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    event.target.innerText = 'Copied!';
    event.target.style.background = '#38a169';
    setTimeout(() => {
      event.target.innerText = 'Copy Short URL';
      event.target.style.background = '#48bb78';
    }, 2000);
  }).catch(err => {
    event.target.innerText = 'Copied!';
    event.target.style.background = '#38a169';
    setTimeout(() => {
      event.target.innerText = 'Copy Short URL';
      event.target.style.background = '#48bb78';
    }, 2000);
  });
}

const openUrl = (url) => {
  window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
});