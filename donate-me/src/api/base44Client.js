const getBaseUrl = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
    return `http://${host}:5000/api`;
  }
  return 'https://donate-me-j4ha.onrender.com/api';
};
const BASE_URL = getBaseUrl();

const getHeaders = () => {
  const token = localStorage.getItem('mock_access_token') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res, contextName) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('mock_access_token');
    localStorage.removeItem('token');
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(text || `${contextName} failed`);
  }
  if (!res.ok || !data.success) {
    throw {
      status: res.status,
      message: data.message || `${contextName} failed`,
      errors: data.errors
    };
  }
  return data;
};

// Generic HTTP entity wrapper
class HttpEntity {
  constructor(endpoint, name, serializers = {}) {
    this.endpoint = endpoint;
    this.name = name;
    this.toBackend = serializers.toBackend || ((p) => p);
    this.toFrontend = serializers.toFrontend || ((i) => i);
  }

  async uploadFormFiles(payload) {
    const resolvedPayload = { ...payload };
    for (const key of Object.keys(resolvedPayload)) {
      const val = resolvedPayload[key];
      if (val instanceof File) {
        // Upload the file first!
        const uploadRes = await base44.integrations.Core.UploadFile({ file: val });
        resolvedPayload[key] = uploadRes.file_url;
      }
    }
    return resolvedPayload;
  }

  async list(order = '', limit = 100) {
    const headers = getHeaders();
    let url = `${BASE_URL}${this.endpoint}`;
    const params = new URLSearchParams();
    if (order) params.append('sort', order);
    if (limit) params.append('limit', limit);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { headers });
    const data = await handleResponse(res, `List ${this.name}`);
    
    const items = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);
    return items.map(this.toFrontend);
  }

  async get(id) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}${this.endpoint}/${id}`, { headers });
    const data = await handleResponse(res, `Get ${this.name}`);
    return this.toFrontend(data.data);
  }

  async create(payload) {
    const headers = getHeaders();
    const resolvedPayload = await this.uploadFormFiles(payload);
    const backendPayload = this.toBackend(resolvedPayload);
    
    const res = await fetch(`${BASE_URL}${this.endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload)
    });
    const data = await handleResponse(res, `Create ${this.name}`);
    return this.toFrontend(data.data);
  }

  async update(id, payload) {
    const headers = getHeaders();
    const resolvedPayload = await this.uploadFormFiles(payload);
    const backendPayload = this.toBackend(resolvedPayload);
    
    const res = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(backendPayload)
    });
    const data = await handleResponse(res, `Update ${this.name}`);
    return this.toFrontend(data.data);
  }

  async delete(id) {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleResponse(res, `Delete ${this.name}`);
    return { success: true };
  }
}

// ---------------------- SERALIZATION RULES ----------------------

const staffSerializers = {
  toBackend: (p) => ({
    employeeId: p.employee_id,
    fullName: p.full_name,
    mobile: p.mobile,
    email: p.email,
    address: p.address || 'Ashram Campus',
    role: p.role || 'Admin',
    joiningDate: p.joining_date || new Date().toISOString(),
    status: p.status || 'Active',
    photo: p.photo || ''
  }),
  toFrontend: (i) => ({
    id: i._id,
    employee_id: i.employeeId,
    full_name: i.fullName,
    mobile: i.mobile,
    email: i.email,
    address: i.address,
    role: i.role,
    joining_date: i.joiningDate,
    status: i.status,
    photo: i.photo,
    created_date: i.createdAt
  })
};

const residentSerializers = {
  toBackend: (p) => ({
    residentId: p.resident_id || p.residentId,
    photo: p.photo || '',
    name: p.name || p.full_name || '',
    age: Number(p.age),
    gender: p.gender || 'Male',
    address: p.address || '',
    admissionDate: p.admission_date || p.admissionDate || new Date().toISOString(),
    admissionTime: p.admission_time || p.admissionTime || '',
    fatherHusbandName: p.father_husband_name || p.fatherHusbandName || '',
    identificationMark: p.identification_mark || p.identificationMark || '',
    physicalCondition: p.physical_condition || p.physicalCondition || '',
    healthCondition: p.health_condition || p.healthCondition || '',
    broughtFrom: p.brought_from || p.broughtFrom || '',
    institutionName: p.institution_name || p.institutionName || '',
    informerName: p.informer_name || p.informerName || '',
    informerAddress: p.informer_address || p.informerAddress || '',
    informerMobile: p.informer_mobile || p.informerMobile || '',
    guardianName: p.guardian_name || p.guardianName || '',
    guardianAddress: p.guardian_address || p.guardianAddress || '',
    guardianMobile: p.guardian_mobile || p.guardianMobile || '',
    remarks: p.remarks || '',
    status: p.status || 'Active',
    guardianDetails: {
      name: p.guardian_name || 'None',
      mobile: p.guardian_mobile || '0000000000',
      relation: 'Self'
    }
  }),
  toFrontend: (i) => ({
    id: i._id,
    resident_id: i.residentId,
    residentId: i.residentId,
    photo: i.photo,
    name: i.name,
    full_name: i.name,
    age: i.age,
    gender: i.gender,
    address: i.address || '',
    admission_date: i.admissionDate,
    admissionDate: i.admissionDate,
    admission_time: i.admissionTime || '',
    admissionTime: i.admissionTime || '',
    father_husband_name: i.fatherHusbandName || '',
    fatherHusbandName: i.fatherHusbandName || '',
    identification_mark: i.identificationMark || '',
    identificationMark: i.identificationMark || '',
    physical_condition: i.physicalCondition || '',
    physicalCondition: i.physicalCondition || '',
    health_condition: i.healthCondition || '',
    healthCondition: i.healthCondition || '',
    brought_from: i.broughtFrom || '',
    broughtFrom: i.broughtFrom || '',
    institution_name: i.institutionName || '',
    institutionName: i.institutionName || '',
    informer_name: i.informerName || '',
    informerName: i.informerName || '',
    informer_address: i.informerAddress || '',
    informerAddress: i.informerAddress || '',
    informer_mobile: i.informerMobile || '',
    informerMobile: i.informerMobile || '',
    guardian_name: i.guardianName || i.guardianDetails?.name || '',
    guardianName: i.guardianName || i.guardianDetails?.name || '',
    guardian_address: i.guardianAddress || '',
    guardianAddress: i.guardianAddress || '',
    guardian_mobile: i.guardianMobile || i.guardianDetails?.mobile || '',
    guardianMobile: i.guardianMobile || i.guardianDetails?.mobile || '',
    remarks: i.remarks || '',
    status: i.status || 'Active',
    created_date: i.createdAt
  })
};

const donorSerializers = {
  toBackend: (p) => ({
    name: p.full_name || p.name,
    mobile: p.mobile || '0000000000',
    email: p.email,
    address: p.address || ''
  }),
  toFrontend: (i) => ({
    id: i._id,
    full_name: i.name,
    name: i.name,
    mobile: i.mobile,
    email: i.email,
    address: i.address,
    created_date: i.createdAt
  })
};

const donationSerializers = {
  toBackend: (p) => {
    const payload = {
      amount: Number(p.amount),
      transactionId: p.transaction_id || p.transactionId,
      screenshot: p.screenshot_url || p.screenshot || '',
      verificationStatus: p.verification_status || p.verificationStatus || 'Pending',
      notes: p.purpose || p.message || p.notes || '',
      mobile: p.mobile || ''
    };
    if (p.donor_id || p.donorId) {
      payload.donorId = p.donor_id || p.donorId;
    } else if (p.donor_name) {
      payload.donorDetails = {
        name: p.donor_name,
        mobile: p.mobile || '0000000000',
        email: p.email || `${p.donor_name.replace(/\s+/g, '').toLowerCase() || 'donor'}@example.com`,
        address: p.address || ''
      };
    }
    return payload;
  },
  toFrontend: (i) => ({
    id: i._id,
    donor_id: i.donorId?._id || i.donorId,
    donor_name: i.donorId?.name || 'Donor',
    mobile: i.donorId?.mobile || '',
    email: i.donorId?.email || '',
    amount: i.amount,
    transaction_id: i.transactionId,
    screenshot_url: i.screenshot,
    screenshot: i.screenshot,
    verification_status: i.verificationStatus,
    purpose: i.notes,
    notes: i.notes,
    message: i.notes,
    donation_date: i.donationDate,
    created_date: i.createdAt
  })
};

const volunteerSerializers = {
  toBackend: (p) => ({
    volunteerId: p.volunteer_id || p.volunteerId || '',
    photo: p.photo || '',
    fullName: p.full_name || p.name || '',
    mobile: p.mobile,
    email: p.email,
    address: p.address || '',
    skills: Array.isArray(p.skills) ? p.skills : (p.skills ? p.skills.split(',').map(s => s.trim()) : []),
    interests: Array.isArray(p.interests) ? p.interests : (p.interests ? p.interests.split(',').map(i => i.trim()) : []),
    totalHours: Number(p.total_hours || p.totalHours) || 0,
    status: p.status || 'Active'
  }),
  toFrontend: (i) => ({
    id: i._id,
    volunteer_id: i.volunteerId,
    volunteerId: i.volunteerId,
    photo: i.photo || '',
    full_name: i.fullName,
    name: i.fullName,
    mobile: i.mobile,
    email: i.email,
    address: i.address,
    skills: Array.isArray(i.skills) ? i.skills.join(', ') : i.skills,
    interests: Array.isArray(i.interests) ? i.interests.join(', ') : i.interests,
    total_hours: i.totalHours,
    totalHours: i.totalHours,
    status: i.status || 'Active',
    created_date: i.createdAt,
    join_date: i.createdAt
  })
};

const eventSerializers = {
  toBackend: (p) => ({
    title: p.title || p.eventName,
    description: p.description || '',
    startDate: p.event_date || p.startDate || p.date || new Date().toISOString(),
    endDate: p.end_date || p.endDate || '',
    location: p.location || '',
    volunteers: p.volunteers || [],
    gallery: p.gallery_urls || p.gallery_images || (p.image_url ? [p.image_url] : (p.image ? [p.image] : [])),
    image: p.image || p.image_url || '',
    status: p.status || 'Upcoming',
    category: p.category || 'Other',
    coordinator: p.coordinator || '',
    budget: Number(p.budget) || 0,
    spent: Number(p.spent) || 0,
    volunteers_assigned: Number(p.volunteers_assigned) || 0,
    attendees: Number(p.attendees) || 0
  }),
  toFrontend: (i) => ({
    id: i._id,
    title: i.title,
    eventName: i.title,
    description: i.description || '',
    event_date: i.startDate || i.date,
    date: i.startDate || i.date,
    startDate: i.startDate || i.date,
    end_date: i.endDate || '',
    endDate: i.endDate || '',
    location: i.location || '',
    volunteers: i.volunteers || [],
    gallery_urls: i.gallery || [],
    gallery_images: i.gallery || [],
    image: i.image || (i.gallery && i.gallery.length > 0 ? i.gallery[0] : ''),
    image_url: i.image || (i.gallery && i.gallery.length > 0 ? i.gallery[0] : ''),
    status: i.status || 'Upcoming',
    category: i.category || 'Other',
    coordinator: i.coordinator || '',
    budget: i.budget || 0,
    spent: i.spent || 0,
    volunteers_assigned: i.volunteers_assigned || 0,
    attendees: i.attendees || 0,
    created_date: i.createdAt
  })
};

const wishWallSerializers = {
  toBackend: (p) => ({
    title: p.title || p.wish_item || 'Welfare Need',
    quantity: 1,
    priority: p.priority || 'Medium',
    status: p.status === 'Open' ? 'Pending' : (p.status === 'In Progress' ? 'Partially Fulfilled' : (p.status === 'Closed' ? 'Fulfilled' : (p.status || 'Pending'))),
    description: JSON.stringify({
      description: p.description || '',
      category: p.category || 'Other',
      estimated_cost: Number(p.estimated_cost) || 0,
      requested_by: p.requested_by || 'Staff',
      target_date: p.target_date || ''
    })
  }),
  toFrontend: (i) => {
    let extra = {};
    try {
      extra = JSON.parse(i.description);
    } catch (e) {
      extra = { description: i.description };
    }
    return {
      id: i._id,
      title: i.title,
      description: extra.description || i.description,
      category: extra.category || 'Other',
      estimated_cost: extra.estimated_cost || 0,
      requested_by: extra.requested_by || 'Staff',
      target_date: extra.target_date || '',
      priority: i.priority,
      status: i.status === 'Pending' ? 'Open' : (i.status === 'Partially Fulfilled' ? 'In Progress' : i.status),
      created_date: i.createdAt
    };
  }
};

const auditLogSerializers = {
  toFrontend: (i) => ({
    id: i._id,
    user_name: i.user?.name || 'System User',
    action: i.action,
    details: typeof i.details === 'object' ? JSON.stringify(i.details) : i.details,
    created_date: i.timestamp
  })
};

const qrConfigSerializers = {
  toBackend: (p) => ({
    bankName: p.bank_name || '',
    accountHolder: p.account_holder || '',
    accountNumber: p.account_number || '',
    ifscCode: p.ifsc_code || '',
    upiId: p.upi_id || '',
    upiName: p.bank_name || '',
    totalReceived: Number(p.total_received) || 0,
    qrImage: p.qr_image || '',
    isActive: p.is_active !== undefined ? p.is_active : true
  }),
  toFrontend: (i) => ({
    id: i._id,
    bank_name: i.bankName || i.upiName || '',
    account_holder: i.accountHolder || '',
    account_number: i.accountNumber || '',
    ifsc_code: i.ifscCode || '',
    upi_id: i.upiId || '',
    upiName: i.upiName || '',
    total_received: i.totalReceived || 0,
    qr_image: i.qrImage || '',
    is_active: i.isActive,
    status: i.isActive ? 'Active' : 'Inactive',
    created_date: i.createdAt
  })
};

const wishItemSerializers = {
  toBackend: (p) => ({
    title: p.title_en || p.title || 'Welfare Need',
    quantity: p.quantity_needed || 1,
    priority: p.priority === 'high' ? 'High' : (p.priority === 'low' ? 'Low' : 'Medium'),
    status: p.quantity_fulfilled >= p.quantity_needed ? 'Fulfilled' : (p.quantity_fulfilled > 0 ? 'Partially Fulfilled' : 'Pending'),
    description: JSON.stringify({
      title_gu: p.title_gu || '',
      title_en: p.title_en || '',
      title_hi: p.title_hi || '',
      description_gu: p.description_gu || '',
      description_en: p.description_en || '',
      description_hi: p.description_hi || '',
      category: p.category || 'supplies',
      quantity_needed: p.quantity_needed || 1,
      quantity_fulfilled: p.quantity_fulfilled || 0,
      icon: p.icon || ''
    })
  }),
  toFrontend: (i) => {
    let extra = {};
    try {
      extra = JSON.parse(i.description);
    } catch (e) {
      extra = { description: i.description };
    }
    
    // Normalize category
    let cat = (extra.category || 'supplies').toLowerCase();
    if (cat === 'medical' || cat === 'health') cat = 'health';
    else if (cat === 'education') cat = 'education';
    else if (cat === 'food') cat = 'food';
    else cat = 'supplies';

    // Normalize priority
    let prio = (i.priority || 'medium').toLowerCase();
    if (prio === 'urgent' || prio === 'high') prio = 'high';
    else if (prio === 'low') prio = 'low';
    else prio = 'medium';

    const quantity_needed = extra.quantity_needed || i.quantity || 1;
    const quantity_fulfilled = i.status === 'Fulfilled' ? quantity_needed : (extra.quantity_fulfilled || 0);

    return {
      id: i._id,
      title_en: extra.title_en || i.title || '',
      title_gu: extra.title_gu || i.title || '',
      title_hi: extra.title_hi || i.title || '',
      description_en: extra.description_en !== undefined ? extra.description_en : (extra.description !== undefined ? extra.description : ''),
      description_gu: extra.description_gu || '',
      description_hi: extra.description_hi || '',
      category: cat,
      priority: prio,
      quantity_needed,
      quantity_fulfilled,
      icon: extra.icon || '',
      created_date: i.createdAt
    };
  }
};

const contactMessageEntity = {
  create: async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Contact Message received:', payload);
    return { success: true, data: payload };
  }
};


// ---------------------- DYNAMIC QR CONFIG LOGIC ----------------------
const qrEntity = {
  list: async () => {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/qr/details`, { headers });
    const data = await handleResponse(res, 'Fetch QR Config');
    
    const genRes = await fetch(`${BASE_URL}/qr/generate`, { headers });
    const genData = await handleResponse(genRes, 'Generate QR');
    
    return [{
      id: 'qr-config-id',
      title: data.data.upiName,
      purpose: data.data.upiId,
      qr_code_url: genData.qrDataUrl,
      qr_image: genData.qrDataUrl,
      status: 'Active',
      created_date: new Date().toISOString()
    }];
  },
  get: async () => {
    const listData = await qrEntity.list();
    return listData[0];
  },
  create: async (payload) => {
    const headers = getHeaders();
    const res = await fetch(`${BASE_URL}/qr/store`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        upiId: payload.purpose,
        upiName: payload.title
      })
    });
    const data = await handleResponse(res, 'Save QR Config');
    
    const genRes = await fetch(`${BASE_URL}/qr/generate`, { headers });
    const genData = await handleResponse(genRes, 'Generate QR');

    return {
      id: data.data._id,
      title: data.data.upiName,
      purpose: data.data.upiId,
      qr_code_url: genData.qrDataUrl,
      qr_image: genData.qrDataUrl,
      status: 'Active'
    };
  },
  update: async (id, payload) => {
    return qrEntity.create(payload);
  },
  delete: async () => {
    return { success: true };
  }
};

// ---------------------- EXPORTED CLIENT ----------------------
export const base44 = {
  auth: {
    me: async () => {
      const headers = getHeaders();
      const res = await fetch(`${BASE_URL}/auth/me`, { headers });
      const data = await handleResponse(res, 'Get Me');
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };
    },
    loginViaEmailPassword: async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res, 'Login');
      localStorage.setItem('mock_access_token', data.token);
      localStorage.setItem('token', data.token);
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };
    },
    logout: (redirectUrl) => {
      localStorage.removeItem('mock_access_token');
      localStorage.removeItem('token');
      if (redirectUrl) {
        window.location.href = '/login';
      }
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = '/login';
    },
    loginWithProvider: (provider, redirectUrl) => {
      window.location.href = '/login';
    },
    register: async ({ email, password }) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email.split('@')[0], email, password, role: 'Admin' })
      });
      return handleResponse(res, 'Register');
    },
    verifyOtp: async ({ email, otpCode }) => {
      return { access_token: 'mock-token-xyz' };
    },
    resendOtp: async (email) => {
      return { success: true };
    },
    setToken: (token) => {
      localStorage.setItem('mock_access_token', token);
      localStorage.setItem('token', token);
    }
  },
  entities: {
    Staff: new HttpEntity('/staff', 'Staff', staffSerializers),
    Resident: new HttpEntity('/residents', 'Resident', residentSerializers),
    Donation: new HttpEntity('/donations', 'Donation', donationSerializers),
    DonationSubmission: new HttpEntity('/donations', 'Donation', donationSerializers),
    Donor: new HttpEntity('/donors', 'Donor', donorSerializers),
    Volunteer: new HttpEntity('/volunteers', 'Volunteer', volunteerSerializers),
    Event: new HttpEntity('/events', 'Event', eventSerializers),
    WishWall: new HttpEntity('/requirements', 'WishWall', wishWallSerializers),
    WishItem: new HttpEntity('/requirements', 'WishItem', wishItemSerializers),
    ContactMessage: new HttpEntity('/messages', 'ContactMessage'),
    QRDonation: new HttpEntity('/qr/details', 'QRDonation', qrConfigSerializers),
    RequirementContribution: new HttpEntity('/contributions', 'RequirementContribution'),
    AuditLog: new HttpEntity('/dashboard', 'AuditLog', { toFrontend: auditLogSerializers.toFrontend })
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('mock_access_token') || localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          headers,
          body: formData
        });
        const data = await handleResponse(res, 'Upload File');
        return { file_url: data.file_url };
      }
    }
  }
};
