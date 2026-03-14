/* ============================================================
   FIXED ASSET MANAGEMENT SYSTEM — APPLICATION LOGIC
   ============================================================ */

'use strict';

// ─── CONSTANTS ───────────────────────────────────────────────
const STORAGE_KEYS = {
  ASSETS:   'fam_assets',
  USERS:    'fam_users',
  SESSION:  'fam_session',
  SETTINGS: 'fam_settings',
};

const QR_API = (text) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&data=${encodeURIComponent(text)}`;

const QR_API_SIZE = (text, size) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=6&data=${encodeURIComponent(text)}`;

// ─── FIREBASE VARIABLES ───────────────────────────────────────
let db               = null;
let fbAuth           = null;
let FIREBASE_MODE    = false;
let unsubscribeAssets = null;

// ─── DEFAULT / SAMPLE DATA ────────────────────────────────────
const SAMPLE_ASSETS = [
  // ── LAPTOPS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's1',  assetId: 'LAPTOP-001', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2024-07-26', invoiceNumber: '',     vendor: '', assignedTo: 'Liza Madam',    productLife: 5, nextInspection: '2029-07-26', purchaseValue: 0,     status: 'active', notes: '', createdAt: '2024-07-26T08:00:00Z' },
  { id: 's2',  assetId: 'LAPTOP-002', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2024-11-23', invoiceNumber: '',     vendor: '', assignedTo: 'Namit',         productLife: 5, nextInspection: '2029-11-23', purchaseValue: 0,     status: 'active', notes: '', createdAt: '2024-11-23T08:00:00Z' },
  { id: 's3',  assetId: 'LAPTOP-003', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-05-02', invoiceNumber: '78',   vendor: '', assignedTo: 'Ashim Nath',    productLife: 5, nextInspection: '2030-05-02', purchaseValue: 25000, status: 'active', notes: '', createdAt: '2025-05-02T08:00:00Z' },
  { id: 's4',  assetId: 'LAPTOP-004', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-05-02', invoiceNumber: '78',   vendor: '', assignedTo: 'Astha',         productLife: 5, nextInspection: '2030-05-02', purchaseValue: 25000, status: 'active', notes: '', createdAt: '2025-05-02T08:10:00Z' },
  { id: 's5',  assetId: 'LAPTOP-005', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-05-02', invoiceNumber: '78',   vendor: '', assignedTo: 'Gopal Kumar',   productLife: 5, nextInspection: '2030-05-02', purchaseValue: 25000, status: 'active', notes: '', createdAt: '2025-05-02T08:20:00Z' },
  { id: 's6',  assetId: 'LAPTOP-006', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-05-02', invoiceNumber: '78',   vendor: '', assignedTo: 'Krishan Gopal', productLife: 5, nextInspection: '2030-05-02', purchaseValue: 25000, status: 'active', notes: '', createdAt: '2025-05-02T08:30:00Z' },
  { id: 's7',  assetId: 'LAPTOP-007', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-07-21', invoiceNumber: '1050', vendor: '', assignedTo: 'Abhinav',       productLife: 5, nextInspection: '2030-07-21', purchaseValue: 17797, status: 'active', notes: '', createdAt: '2025-07-21T08:00:00Z' },
  { id: 's8',  assetId: 'LAPTOP-008', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-07-21', invoiceNumber: '1050', vendor: '', assignedTo: 'Chandresh',     productLife: 5, nextInspection: '2030-07-21', purchaseValue: 17797, status: 'active', notes: '', createdAt: '2025-07-21T08:10:00Z' },
  { id: 's9',  assetId: 'LAPTOP-009', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: 'Tohidoor',      productLife: 5, nextInspection: '2031-01-31', purchaseValue: 21186, status: 'active', notes: '', createdAt: '2026-01-31T08:00:00Z' },
  { id: 's10', assetId: 'LAPTOP-010', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: 'Dashrath',      productLife: 5, nextInspection: '2031-01-31', purchaseValue: 21186, status: 'active', notes: '', createdAt: '2026-01-31T08:10:00Z' },
  { id: 's11', assetId: 'LAPTOP-011', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: 'Tarun',         productLife: 5, nextInspection: '2031-01-31', purchaseValue: 21186, status: 'active', notes: '', createdAt: '2026-01-31T08:20:00Z' },
  { id: 's12', assetId: 'LAPTOP-012', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: 'Bhanu',         productLife: 5, nextInspection: '2031-01-31', purchaseValue: 21186, status: 'active', notes: '', createdAt: '2026-01-31T08:30:00Z' },
  { id: 's13', assetId: 'LAPTOP-013', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: 'Akhil',         productLife: 5, nextInspection: '2031-01-31', purchaseValue: 21186, status: 'active', notes: '', createdAt: '2026-01-31T08:40:00Z' },
  { id: 's14', assetId: 'LAPTOP-014', name: 'Laptop', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: '',              productLife: 5, nextInspection: '2031-01-31', purchaseValue: 21186, status: 'active', notes: 'Unassigned unit', createdAt: '2026-01-31T08:50:00Z' },
  // ── DESKTOPS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's15', assetId: 'DESKTOP-001', name: 'Desktop Computer', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: '', productLife: 5, nextInspection: '2031-01-31', purchaseValue: 56779, status: 'active', notes: '', createdAt: '2026-01-31T09:00:00Z' },
  { id: 's16', assetId: 'DESKTOP-002', name: 'Desktop Computer', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-01-31', invoiceNumber: '2612', vendor: '', assignedTo: '', productLife: 5, nextInspection: '2031-01-31', purchaseValue: 56779, status: 'active', notes: '', createdAt: '2026-01-31T09:10:00Z' },
  { id: 's17', assetId: 'DESKTOP-003', name: 'Desktop Computer', category: 'Electronics', location: 'SNL Office', purchaseDate: '2026-02-04', invoiceNumber: '2641', vendor: '', assignedTo: '', productLife: 5, nextInspection: '2031-02-04', purchaseValue: 99000, status: 'active', notes: '', createdAt: '2026-02-04T09:00:00Z' },
  // ── PRINTERS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's18', assetId: 'PRINTER-001', name: 'Printer', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-05-27', invoiceNumber: '510', vendor: '', assignedTo: '', productLife: 5, nextInspection: '2030-05-27', purchaseValue: 17372, status: 'active', notes: '', createdAt: '2025-05-27T08:00:00Z' },
  { id: 's19', assetId: 'PRINTER-002', name: 'Printer', category: 'Electronics', location: 'SNL Office', purchaseDate: '2025-05-27', invoiceNumber: '510', vendor: '', assignedTo: '', productLife: 5, nextInspection: '2030-05-27', purchaseValue: 12372, status: 'active', notes: '', createdAt: '2025-05-27T08:10:00Z' },
  // ── GENERATOR ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's20', assetId: 'GENERATOR-001', name: 'Generator', category: 'Equipment', location: 'SNL Office', purchaseDate: '2025-12-29', invoiceNumber: '26', vendor: '', assignedTo: 'Facility', productLife: 15, nextInspection: '2026-12-29', purchaseValue: 595000, status: 'active', notes: '', createdAt: '2025-12-29T08:00:00Z' },
  // ── HEATER ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's21', assetId: 'HEATER-001', name: 'Havells OFR 13-Fin Heater', category: 'Equipment', location: 'SNL Office', purchaseDate: '2026-01-10', invoiceNumber: '19752', vendor: 'Havells', assignedTo: '', productLife: 10, nextInspection: '2027-01-10', purchaseValue: 10932, status: 'active', notes: '', createdAt: '2026-01-10T08:00:00Z' },
  // ── SPLIT ACs — FIRST FLOOR (7 units, total ₹1,12,240) ──────────────────────────────────────────────────────────────────────
  { id: 's22', assetId: 'SPLIT-AC-001', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T09:00:00Z' },
  { id: 's23', assetId: 'SPLIT-AC-002', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T09:10:00Z' },
  { id: 's24', assetId: 'SPLIT-AC-003', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T09:20:00Z' },
  { id: 's25', assetId: 'SPLIT-AC-004', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T09:30:00Z' },
  { id: 's26', assetId: 'SPLIT-AC-005', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T09:40:00Z' },
  { id: 's27', assetId: 'SPLIT-AC-006', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T09:50:00Z' },
  { id: 's28', assetId: 'SPLIT-AC-007', name: 'Split AC', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 16034, status: 'active', notes: '', createdAt: '2025-03-10T10:00:00Z' },
  // ── CASSETTE ACs BIG — FIRST FLOOR (2 units, total ₹79,948) ────────────────────────────────────────────────────────────────
  { id: 's29', assetId: 'CASSETTE-AC-B-001', name: 'Cassette AC (Big)', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-04-15', invoiceNumber: 'AC-404', vendor: 'Daikin', assignedTo: 'Facility', productLife: 10, nextInspection: '2026-04-15', purchaseValue: 39974, status: 'active', notes: '', createdAt: '2025-04-15T09:00:00Z' },
  { id: 's30', assetId: 'CASSETTE-AC-B-002', name: 'Cassette AC (Big)', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-04-15', invoiceNumber: 'AC-404', vendor: 'Daikin', assignedTo: 'Facility', productLife: 10, nextInspection: '2026-04-15', purchaseValue: 39974, status: 'active', notes: '', createdAt: '2025-04-15T09:10:00Z' },
  // ── CASSETTE ACs SMALL — FIRST FLOOR (2 units, total ₹58,144) ──────────────────────────────────────────────────────────────
  { id: 's31', assetId: 'CASSETTE-AC-S-001', name: 'Cassette AC (Small)', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-04-15', invoiceNumber: 'AC-405', vendor: 'Daikin', assignedTo: 'Facility', productLife: 10, nextInspection: '2026-04-15', purchaseValue: 29072, status: 'active', notes: '', createdAt: '2025-04-15T09:20:00Z' },
  { id: 's32', assetId: 'CASSETTE-AC-S-002', name: 'Cassette AC (Small)', category: 'Equipment', location: 'SNL Office - First Floor', purchaseDate: '2025-04-15', invoiceNumber: 'AC-405', vendor: 'Daikin', assignedTo: 'Facility', productLife: 10, nextInspection: '2026-04-15', purchaseValue: 29072, status: 'active', notes: '', createdAt: '2025-04-15T09:30:00Z' },
  // ── AC (OLD) — SECOND FLOOR (2 units) ───────────────────────────────────────────────────────────────────────────────────────
  { id: 's33', assetId: 'AC-OLD-001', name: 'AC (Old)', category: 'Equipment', location: 'SNL Office - Second Floor', purchaseDate: '2023-06-20', invoiceNumber: 'OLD-99', vendor: 'Voltas', assignedTo: 'Staff', productLife: 10, nextInspection: '2026-06-20', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2023-06-20T10:00:00Z' },
  { id: 's34', assetId: 'AC-OLD-002', name: 'AC (Old)', category: 'Equipment', location: 'SNL Office - Second Floor', purchaseDate: '2023-06-20', invoiceNumber: 'OLD-99', vendor: 'Voltas', assignedTo: 'Staff', productLife: 10, nextInspection: '2026-06-20', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2023-06-20T10:10:00Z' },
  // ── CCTV CAMERAS (grouped per floor) ────────────────────────────────────────────────────────────────────────────────────────
  { id: 's35', assetId: 'CCTV-GF',  name: 'CCTV Camera System (GF)', category: 'Electronics', location: 'SNL Office - Ground Floor', purchaseDate: '2025-01-15', invoiceNumber: 'CP-111', vendor: 'CP Plus', assignedTo: 'IT', productLife: 5, nextInspection: '2026-01-15', purchaseValue: 24000, status: 'active', notes: '8 units', createdAt: '2025-01-15T08:00:00Z' },
  { id: 's36', assetId: 'CCTV-FF',  name: 'CCTV Camera System (FF)', category: 'Electronics', location: 'SNL Office - First Floor',  purchaseDate: '2025-01-15', invoiceNumber: 'CP-111', vendor: 'CP Plus', assignedTo: 'IT', productLife: 5, nextInspection: '2026-01-15', purchaseValue: 33000, status: 'active', notes: '11 units', createdAt: '2025-01-15T08:10:00Z' },
  { id: 's37', assetId: 'CCTV-SF',  name: 'CCTV Camera System (SF)', category: 'Electronics', location: 'SNL Office - Second Floor', purchaseDate: '2025-01-15', invoiceNumber: 'CP-111', vendor: 'CP Plus', assignedTo: 'IT', productLife: 5, nextInspection: '2026-01-15', purchaseValue: 15000, status: 'active', notes: '5 units', createdAt: '2025-01-15T08:20:00Z' },
  // ── CHAIRS ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's38', assetId: 'CHAIR-GF-NEW', name: 'Office Chair (Ergonomic)',    category: 'Furniture', location: 'SNL Office - Ground Floor', purchaseDate: '2026-01-31', invoiceNumber: 'FUR-2073', vendor: 'Featherlite', assignedTo: 'Various', productLife: 10, nextInspection: '2036-01-31', purchaseValue: 21000, status: 'active', notes: '10 units @ ₹2,100 each', createdAt: '2026-01-31T08:00:00Z' },
  { id: 's39', assetId: 'CHAIR-GF-OLD', name: 'Office Chair (Old)', category: 'Furniture', location: 'SNL Office - Ground Floor', purchaseDate: '2022-11-10', invoiceNumber: 'OLD-FUR', vendor: 'Local Market', assignedTo: 'Various', productLife: 5, nextInspection: '2026-11-10', purchaseValue: 8000, status: 'active', notes: '10 units (older stock)', createdAt: '2022-11-10T09:00:00Z' },
  { id: 's40', assetId: 'CHAIR-DIR',    name: 'Director Chair (Premium)', category: 'Furniture', location: 'SNL Office - Ground Floor', purchaseDate: '2024-05-15', invoiceNumber: 'DIR-01', vendor: 'Godrej', assignedTo: 'Director', productLife: 10, nextInspection: '2034-05-15', purchaseValue: 15000, status: 'active', notes: '', createdAt: '2024-05-15T11:00:00Z' },
  // ── TABLES ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's41', assetId: 'TABLE-GF-OLD',  name: 'Office Table (Old)',      category: 'Furniture', location: 'SNL Office - Ground Floor', purchaseDate: '2022-11-10', invoiceNumber: 'OLD-FUR', vendor: 'Local Market', assignedTo: 'Various', productLife: 10, nextInspection: '2032-11-10', purchaseValue: 25000, status: 'active', notes: '5 units', createdAt: '2022-11-10T09:10:00Z' },
  { id: 's42', assetId: 'TABLE-GF-NEW',  name: 'Office Table (Workstation)',      category: 'Furniture', location: 'SNL Office - Ground Floor', purchaseDate: '2025-06-20', invoiceNumber: 'ST-555', vendor: 'Spacewood', assignedTo: 'Various', productLife: 10, nextInspection: '2035-06-20', purchaseValue: 65000, status: 'active', notes: '13 units', createdAt: '2025-06-20T10:00:00Z' },
  { id: 's43', assetId: 'TABLE-FF',      name: 'Office Table (First Floor)',            category: 'Furniture', location: 'SNL Office - First Floor',  purchaseDate: '2025-06-20', invoiceNumber: 'ST-555', vendor: 'Spacewood', assignedTo: 'Various', productLife: 10, nextInspection: '2035-06-20', purchaseValue: 25000, status: 'active', notes: '5 units', createdAt: '2025-06-20T10:10:00Z' },
  { id: 's44', assetId: 'TABLE-CONF',    name: 'Conference Room Table',   category: 'Furniture', location: 'SNL Office - First Floor',  purchaseDate: '2025-06-20', invoiceNumber: 'ST-556', vendor: 'Spacewood', assignedTo: 'Meeting Room', productLife: 15, nextInspection: '2040-06-20', purchaseValue: 18000, status: 'active', notes: 'Main Meeting Table', createdAt: '2025-06-20T10:20:00Z' },
  // ── FANS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's45', assetId: 'FAN-GF',      name: 'Ceiling Fan (Usha)', category: 'Equipment', location: 'SNL Office - Ground Floor', purchaseDate: '2024-03-12', invoiceNumber: 'FAN-GF', vendor: 'Usha', assignedTo: 'Admin', productLife: 10, nextInspection: '2027-03-12', purchaseValue: 12000, status: 'active', notes: '6 units', createdAt: '2024-03-12T10:00:00Z' },
  { id: 's46', assetId: 'FAN-GF-WALL', name: 'Wall Fan (Crompton)',    category: 'Equipment', location: 'SNL Office - Ground Floor', purchaseDate: '2024-03-12', invoiceNumber: 'FAN-GF', vendor: 'Crompton', assignedTo: 'Admin', productLife: 10, nextInspection: '2027-03-12', purchaseValue: 2500, status: 'active', notes: '1 unit', createdAt: '2024-03-12T10:10:00Z' },
  { id: 's47', assetId: 'FAN-FF',      name: 'Ceiling Fan (Usha)', category: 'Equipment', location: 'SNL Office - First Floor',  purchaseDate: '2024-03-12', invoiceNumber: 'FAN-FF', vendor: 'Usha', assignedTo: 'Facility', productLife: 10, nextInspection: '2027-03-12', purchaseValue: 8000, status: 'active', notes: '4 units', createdAt: '2024-03-12T10:20:00Z' },
  { id: 's48', assetId: 'FAN-SF',      name: 'Ceiling Fan (Usha)', category: 'Equipment', location: 'SNL Office - Second Floor', purchaseDate: '2024-03-12', invoiceNumber: 'FAN-SF', vendor: 'Usha', assignedTo: 'Facility', productLife: 10, nextInspection: '2027-03-12', purchaseValue: 8000, status: 'active', notes: '4 units', createdAt: '2024-03-12T10:30:00Z' },
  // ── REFRIGERATORS — GROUND FLOOR ────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's49', assetId: 'FRIDGE-001', name: 'Refrigerator (Samsung)',  category: 'Equipment', location: 'SNL Office - Ground Floor', purchaseDate: '2024-05-10', invoiceNumber: 'APP-909', vendor: 'Samsung Store', assignedTo: 'Pantry', productLife: 10, nextInspection: '2026-05-10', purchaseValue: 45000, status: 'active', notes: '', createdAt: '2024-05-10T09:00:00Z' },
  { id: 's50', assetId: 'FRIDGE-002', name: 'Deep Freezer (Blue Star)',  category: 'Equipment', location: 'SNL Office - Ground Floor', purchaseDate: '2024-05-10', invoiceNumber: 'APP-909', vendor: 'Blue Star', assignedTo: 'Pantry', productLife: 10, nextInspection: '2026-05-10', purchaseValue: 18000, status: 'active', notes: '', createdAt: '2024-05-10T09:10:00Z' },
  // ── MISCELLANEOUS ────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { id: 's51', assetId: 'RO-001',      name: 'RO Water Purifier (Kent)', category: 'Equipment', location: 'SNL Office - Ground Floor', purchaseDate: '2024-08-15', invoiceNumber: 'WT-01', vendor: 'Kent RO', assignedTo: 'Facility', productLife: 5,  nextInspection: '2025-08-15', purchaseValue: 14000, status: 'active', notes: '', createdAt: '2024-08-15T11:00:00Z' },
  { id: 's52', assetId: 'ALMIRAH-001', name: 'Steel Almirah',           category: 'Furniture', location: 'SNL Office - Ground Floor', purchaseDate: '2024-02-10', invoiceNumber: 'FUR-11', vendor: 'Local Fabricator', assignedTo: 'Admin', productLife: 15, nextInspection: '2034-02-10', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2024-02-10T10:00:00Z' },
  { id: 's53', assetId: 'COOLER-001',  name: 'Water Cooler (Voltas)',      category: 'Equipment', location: 'SNL Office - Second Floor', purchaseDate: '2024-04-15', invoiceNumber: 'WT-02', vendor: 'Voltas', assignedTo: 'Staff', productLife: 8,  nextInspection: '2026-04-15', purchaseValue: 19500, status: 'active', notes: '', createdAt: '2024-04-15T09:00:00Z' },
  { id: 's54', assetId: 'REMOTE-AC',   name: 'AC Remote Control Set', category: 'Electronics', location: 'SNL Office',            purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Various', productLife: 5,  nextInspection: '2026-03-10', purchaseValue: 15950, status: 'active', notes: '11 units', createdAt: '2025-03-10T11:00:00Z' },
  // ── BEDS — SECOND FLOOR (4 units) ───────────────────────────────────────────────────────────────────────────────────────────
  { id: 's55', assetId: 'BED-001', name: 'Single Bed (Wooden)', category: 'Furniture', location: 'SNL Office - Second Floor', purchaseDate: '2023-12-05', invoiceNumber: 'BED-04', vendor: 'Kurlon', assignedTo: 'Staff Quarters', productLife: 15, nextInspection: '2033-12-05', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2023-12-05T10:00:00Z' },
  { id: 's56', assetId: 'BED-002', name: 'Single Bed (Wooden)', category: 'Furniture', location: 'SNL Office - Second Floor', purchaseDate: '2023-12-05', invoiceNumber: 'BED-04', vendor: 'Kurlon', assignedTo: 'Staff Quarters', productLife: 15, nextInspection: '2033-12-05', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2023-12-05T10:10:00Z' },
  { id: 's57', assetId: 'BED-003', name: 'Single Bed (Wooden)', category: 'Furniture', location: 'SNL Office - Second Floor', purchaseDate: '2023-12-05', invoiceNumber: 'BED-04', vendor: 'Kurlon', assignedTo: 'Staff Quarters', productLife: 15, nextInspection: '2033-12-05', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2023-12-05T10:20:00Z' },
  { id: 's58', assetId: 'BED-004', name: 'Single Bed (Wooden)', category: 'Furniture', location: 'SNL Office - Second Floor', purchaseDate: '2023-12-05', invoiceNumber: 'BED-04', vendor: 'Kurlon', assignedTo: 'Staff Quarters', productLife: 15, nextInspection: '2033-12-05', purchaseValue: 12000, status: 'active', notes: '', createdAt: '2023-12-05T10:30:00Z' },
  // ── AC OUTDOOR UNITS — SECOND FLOOR (2 units) ───────────────────────────────────────────────────────────────────────────────
  { id: 's59', assetId: 'AC-ODU-001', name: 'AC Outdoor Unit', category: 'Equipment', location: 'SNL Office - Second Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 0, status: 'active', notes: 'Linked to SPLIT-AC-001', createdAt: '2025-03-10T12:00:00Z' },
  { id: 's60', assetId: 'AC-ODU-002', name: 'AC Outdoor Unit', category: 'Equipment', location: 'SNL Office - Second Floor', purchaseDate: '2025-03-10', invoiceNumber: 'AC-101', vendor: 'Blue Star', assignedTo: 'Admin', productLife: 10, nextInspection: '2026-03-10', purchaseValue: 0, status: 'active', notes: 'Linked to SPLIT-AC-002', createdAt: '2025-03-10T12:10:00Z' },
];

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'Administrator', displayName: 'Admin' }
];

const DEFAULT_SETTINGS = {
  companyName: 'SNL',
  assetPrefix: 'ASSET',
  perPage: 10,
  viewerBaseUrl: '',   // e.g. http://192.168.1.100:8080/asset-view.html
};

// ─── STATE ────────────────────────────────────────────────────
let state = {
  assets:       [],
  session:      null,
  users:        [],
  settings:     { ...DEFAULT_SETTINGS },
  sortKey:      'createdAt',
  sortDir:      'desc',
  currentPage:  1,
  charts:       {},
  viewingAssetId: null,
};

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  updateDateDisplay();
  initFirebase();           // sets FIREBASE_MODE; calls setupAuthListener() if configured
  if (!FIREBASE_MODE) {
    checkSession();         // local-mode only — Firebase auth state handles this in cloud mode
  }
  // QR preview live update
  ['fAssetId','fName'].forEach(fid => {
    const el = document.getElementById(fid);
    if (el) el.addEventListener('input', () => { if (document.getElementById('fAssetId').value.trim()) updateFormQR(); });
  });
});

function loadStorage() {
  state.assets   = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS)   || 'null') || SAMPLE_ASSETS;
  state.users    = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)    || 'null') || DEFAULT_USERS;
  state.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null') || { ...DEFAULT_SETTINGS };
  state.session  = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)  || 'null');
}

function saveAssets() {
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(state.assets));
}

// ─── FIREBASE INIT ────────────────────────────────────────────
function initFirebase() {
  try {
    if (typeof FIREBASE_CONFIG === 'undefined') return;
    if ((FIREBASE_CONFIG.apiKey || '').startsWith('PASTE_')) return;
    firebase.initializeApp(FIREBASE_CONFIG);
    db     = firebase.firestore();
    fbAuth = firebase.auth();
    FIREBASE_MODE = true;
    // Auto-fill viewerBaseUrl from LIVE_VIEWER_URL if set or if it was empty
    if (typeof LIVE_VIEWER_URL !== 'undefined' && LIVE_VIEWER_URL) {
      if (!state.settings.viewerBaseUrl || state.settings.viewerBaseUrl === '') {
        state.settings.viewerBaseUrl = LIVE_VIEWER_URL;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      }
    }
    // Update login UI to show cloud mode
    const tag = document.getElementById('cloudModeTag');
    if (tag) tag.style.display = 'block';
    const hint = document.getElementById('loginHint');
    if (hint) hint.style.display = 'none';
    const lbl = document.getElementById('loginUsernameLabel');
    if (lbl) lbl.textContent = 'Email Address';
    const inp = document.getElementById('loginUsername');
    if (inp) { inp.type = 'email'; inp.placeholder = 'Enter your email'; }
    setupAuthListener();
    console.log('✅ Firebase cloud mode active');
  } catch (e) {
    console.warn('Firebase init failed, running in local mode:', e.message);
  }
}

function setupAuthListener() {
  fbAuth.onAuthStateChanged(user => {
    if (user) {
      const displayName = user.displayName || user.email;
      loginSuccess(displayName);
      setupFirestoreListener();
    } else {
      if (unsubscribeAssets) { unsubscribeAssets(); unsubscribeAssets = null; }
      document.getElementById('mainApp').style.display = 'none';
      document.getElementById('loginPage').style.display = 'flex';
    }
  });
}

function setupFirestoreListener() {
  if (unsubscribeAssets) { unsubscribeAssets(); }
  unsubscribeAssets = db.collection('assets').onSnapshot(snap => {
    state.assets = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    // Refresh whichever section is currently visible
    const active = Object.keys(SECTION_MAP).find(k => {
      const el = document.getElementById(SECTION_MAP[k].el);
      return el && el.style.display !== 'none';
    });
    if (active === 'dashboard')     initDashboard();
    if (active === 'assetRegister') { populateLocationFilter(); renderAssetTable(); }
    if (active === 'qrManager')     renderQRGrid();
  }, err => console.error('Firestore error:', err));

  // Load settings from Firestore
  db.collection('config').doc('settings').get().then(doc => {
    if (doc.exists) {
      state.settings = { ...DEFAULT_SETTINGS, ...doc.data() };
      const cn = document.getElementById('companyName');
      if (cn) {
        cn.value = state.settings.companyName;
        document.getElementById('assetPrefix').value     = state.settings.assetPrefix;
        document.getElementById('perPageSetting').value  = state.settings.perPage;
        document.getElementById('viewerBaseUrl').value   = state.settings.viewerBaseUrl || '';
        document.querySelector('.sidebar-logo span').textContent = state.settings.companyName + ' Assets';
      }
    }
  }).catch(() => {});
}

async function fbSaveAsset(asset) {
  if (!FIREBASE_MODE || !db) return;
  try {
    await db.collection('assets').doc(asset.id).set(asset);
  } catch (e) {
    showToast('Cloud sync failed: ' + e.message, 'danger');
  }
}

async function fbDeleteAsset(id) {
  if (!FIREBASE_MODE || !db) return;
  try {
    await db.collection('assets').doc(id).delete();
  } catch (e) {
    showToast('Cloud delete failed: ' + e.message, 'danger');
  }
}

function checkSession() {
  if (state.session) {
    loginSuccess(state.session.username);
  }
}

function updateDateDisplay() {
  const d = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const el = document.getElementById('currentDateDisplay');
  if (el) el.textContent = d.toLocaleDateString('en-IN', opts);
}

// ─── AUTH ─────────────────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');

  if (FIREBASE_MODE) {
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in…'; }
    fbAuth.signInWithEmailAndPassword(username, password)
      .then(() => { errEl.classList.add('d-none'); })
      .catch(err => {
        errEl.textContent = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password. Please try again.'
          : 'Login failed: ' + err.message;
        errEl.classList.remove('d-none');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In'; }
      });
    return;
  }

  // Local mode
  const user = state.users.find(u => u.username === username && u.password === password);
  if (!user) {
    errEl.textContent = 'Invalid username or password. Please try again.';
    errEl.classList.remove('d-none');
    return;
  }
  errEl.classList.add('d-none');
  const remember = document.getElementById('rememberMe').checked;
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ username }));
    state.session = { username };
  }
  loginSuccess(username);
}

function loginSuccess(username) {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  document.getElementById('sidebarUsername').textContent = username;
  document.getElementById('navUsername').textContent = username;
  // Load settings into form
  document.getElementById('companyName').value      = state.settings.companyName;
  document.getElementById('assetPrefix').value      = state.settings.assetPrefix;
  document.getElementById('perPageSetting').value   = state.settings.perPage;
  document.getElementById('viewerBaseUrl').value    = state.settings.viewerBaseUrl || '';
  // Update sidebar logo
  document.querySelector('.sidebar-logo span').textContent = state.settings.companyName + ' Assets';
  showSection('dashboard', document.querySelector('.sidebar-nav .nav-link'));
}

function logout() {
  if (FIREBASE_MODE) {
    fbAuth.signOut(); // onAuthStateChanged will update UI
    return;
  }
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  state.session = null;
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

function togglePassword() {
  const input = document.getElementById('loginPassword');
  const icon  = document.getElementById('passwordEye');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// ─── NAVIGATION ───────────────────────────────────────────────
const SECTION_MAP = {
  dashboard:     { el: 'dashboardSection',     title: 'Dashboard' },
  assetRegister: { el: 'assetRegisterSection', title: 'Asset Register' },
  addAsset:      { el: 'addAssetSection',       title: 'Add New Asset' },
  qrManager:     { el: 'qrManagerSection',      title: 'QR Code Manager' },
  reports:       { el: 'reportsSection',        title: 'Reports' },
  settings:      { el: 'settingsSection',       title: 'Settings' },
};

function showSection(key, linkEl) {
  Object.values(SECTION_MAP).forEach(({ el }) => {
    const s = document.getElementById(el);
    if (s) s.style.display = 'none';
  });
  const target = SECTION_MAP[key];
  if (!target) return;
  const el = document.getElementById(target.el);
  if (el) el.style.display = 'block';
  document.getElementById('pageTitle').textContent = target.title;

  // Update active nav link
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
  if (linkEl) {
    linkEl.classList.add('active');
  } else {
    // exact match on visible text
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => {
      if (l.textContent.trim() === target.title) l.classList.add('active');
    });
  }

  // Section-specific init
  if (key === 'dashboard')     initDashboard();
  if (key === 'assetRegister') { populateLocationFilter(); renderAssetTable(); }
  if (key === 'addAsset')      initAddForm();
  if (key === 'qrManager')     renderQRGrid();
  if (key === 'reports')       document.getElementById('reportOutput').style.display = 'none';

  // Close mobile sidebar
  closeSidebar();
}

function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ─── ASSET STATUS LOGIC ───────────────────────────────────────
function getAssetStatus(asset) {
  // Non-active stored statuses (inactive, maintenance, disposed) take precedence
  if (asset.status && !['active','overdue','due'].includes(asset.status)) return asset.status;
  // Dynamically compute active/due/overdue from inspection date
  if (!asset.nextInspection) return 'active';
  const today = new Date(); today.setHours(0,0,0,0);
  const inspDate = new Date(asset.nextInspection);
  const daysLeft = Math.ceil((inspDate - today) / 86400000);
  if (daysLeft < 0)  return 'overdue';
  if (daysLeft <= 30) return 'due';
  return 'active';
}

function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr);
  return Math.ceil((d - today) / 86400000);
}

function statusBadge(status) {
  const map = {
    active:      { cls: 'badge-active',      label: 'Active' },
    due:         { cls: 'badge-due',          label: 'Due for Inspection' },
    overdue:     { cls: 'badge-overdue',      label: 'Overdue' },
    inactive:    { cls: 'badge-inactive',     label: 'Inactive' },
    disposed:    { cls: 'badge-disposed',     label: 'Disposed' },
    maintenance: { cls: 'badge-maintenance',  label: 'Under Maintenance' },
  };
  const s = map[status] || map.active;
  return `<span class="badge-status ${s.cls}">${s.label}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  } catch { return dateStr; }
}

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return '₹' + Number(val).toLocaleString('en-IN');
}

// ─── DASHBOARD ────────────────────────────────────────────────
function initDashboard() {
  const assets = state.assets;
  const statuses = assets.map(a => getAssetStatus(a));

  document.getElementById('statTotal').textContent   = assets.length;
  document.getElementById('statActive').textContent  = statuses.filter(s => s === 'active').length;
  document.getElementById('statDue').textContent     = statuses.filter(s => s === 'due').length;
  document.getElementById('statOverdue').textContent = statuses.filter(s => s === 'overdue').length;

  buildCharts();
  renderRecentAssets();
  renderInspectionTable();
}

function buildCharts() {
  // Location chart
  const locCount = {};
  state.assets.forEach(a => { locCount[a.location || 'Unknown'] = (locCount[a.location || 'Unknown'] || 0) + 1; });
  const catCount = {};
  state.assets.forEach(a => { catCount[a.category || 'Other'] = (catCount[a.category || 'Other'] || 0) + 1; });

  const palette = ['#1e3a5f','#2980b9','#27ae60','#f39c12','#e74c3c','#9b59b6','#1abc9c','#e67e22'];

  renderChart('locationChart', 'doughnut', Object.keys(locCount), Object.values(locCount), palette);
  renderChart('categoryChart', 'bar',      Object.keys(catCount), Object.values(catCount), palette);
}

function renderChart(canvasId, type, labels, data, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (state.charts[canvasId]) { state.charts[canvasId].destroy(); }
  state.charts[canvasId] = new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: type === 'doughnut' ? colors : colors.map(c => c + 'cc'),
        borderColor:     type === 'bar' ? colors : undefined,
        borderWidth:     type === 'bar' ? 2 : 0,
        borderRadius:    type === 'bar' ? 6 : 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: type === 'doughnut' ? 'right' : 'none', labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed || ctx.raw} assets` } },
      },
      scales: type === 'bar' ? {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f0f4f8' } },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      } : undefined,
    },
  });
}

function renderRecentAssets() {
  const tbody = document.getElementById('recentAssetsBody');
  const recent = [...state.assets].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,6);
  if (!recent.length) { tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No assets</td></tr>`; return; }
  tbody.innerHTML = recent.map(a => `
    <tr>
      <td><code style="color:var(--primary);font-size:0.82rem">${a.assetId}</code></td>
      <td style="font-size:0.88rem">${a.name}</td>
      <td style="font-size:0.82rem">${a.assignedTo || '—'}</td>
      <td>${statusBadge(getAssetStatus(a))}</td>
    </tr>`).join('');
}

function renderInspectionTable() {
  const tbody = document.getElementById('inspectionBody');
  const upcoming = state.assets
    .filter(a => a.nextInspection && getDaysLeft(a.nextInspection) !== null && getDaysLeft(a.nextInspection) <= 60)
    .sort((a,b) => new Date(a.nextInspection) - new Date(b.nextInspection))
    .slice(0, 6);
  if (!upcoming.length) { tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No upcoming inspections</td></tr>`; return; }
  tbody.innerHTML = upcoming.map(a => {
    const days = getDaysLeft(a.nextInspection);
    const chipCls = days < 0 ? 'days-overdue' : days <= 7 ? 'days-soon' : 'days-ok';
    const daysLabel = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`;
    return `<tr>
      <td style="font-size:0.85rem">${a.name}<br><small class="text-muted">${a.assetId}</small></td>
      <td style="font-size:0.82rem">${a.location || '—'}</td>
      <td style="font-size:0.82rem">${formatDate(a.nextInspection)}</td>
      <td><span class="days-chip ${chipCls}">${daysLabel}</span></td>
    </tr>`;
  }).join('');
}

// ─── ASSET REGISTER TABLE ─────────────────────────────────────
function populateLocationFilter() {
  const sel = document.getElementById('filterLocation');
  const locations = [...new Set(state.assets.map(a => a.location).filter(Boolean))].sort();
  const current = sel.value;
  sel.innerHTML = '<option value="">All Locations</option>' +
    locations.map(l => `<option value="${l}" ${l === current ? 'selected' : ''}>${l}</option>`).join('');
}

function getFilteredAssets() {
  const q    = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const loc  = document.getElementById('filterLocation')?.value || '';
  const cat  = document.getElementById('filterCategory')?.value || '';
  const stat = document.getElementById('filterStatus')?.value || '';

  return state.assets.filter(a => {
    const status = getAssetStatus(a);
    if (loc  && a.location !== loc) return false;
    if (cat  && a.category !== cat) return false;
    if (stat && status !== stat)    return false;
    if (q) {
      const haystack = [a.assetId, a.name, a.assignedTo, a.location, a.vendor, a.invoiceNumber].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }).sort((a,b) => {
    const { sortKey, sortDir } = state;
    let va = a[sortKey] || '';
    let vb = b[sortKey] || '';
    if (sortKey === 'purchaseDate' || sortKey === 'nextInspection' || sortKey === 'createdAt') {
      va = new Date(va || 0); vb = new Date(vb || 0);
    } else {
      va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

function renderAssetTable() {
  const filtered = getFilteredAssets();
  document.getElementById('assetCount').textContent = filtered.length;

  const perPage = state.settings.perPage || 10;
  const pages   = Math.max(1, Math.ceil(filtered.length / perPage));
  if (state.currentPage > pages) state.currentPage = 1;

  const start   = (state.currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);
  const tbody    = document.getElementById('assetTableBody');

  if (!pageData.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="fas fa-box-open"></i><p>No assets found</p></div></td></tr>`;
    document.getElementById('paginationBar').innerHTML = '';
    return;
  }

  tbody.innerHTML = pageData.map(a => {
    const status = getAssetStatus(a);
    return `<tr>
      <td><code style="color:var(--primary);font-size:0.82rem">${a.assetId}</code></td>
      <td>
        ${a.image ? `<img src="${a.image}" class="asset-thumb me-2" alt="">` : ''}
        <span style="font-weight:500">${a.name}</span>
      </td>
      <td><small class="text-muted">${a.category || '—'}</small></td>
      <td><small><i class="fas fa-map-marker-alt me-1 text-danger" style="font-size:0.7rem"></i>${a.location || '—'}</small></td>
      <td><small>${a.assignedTo || '—'}</small></td>
      <td><small>${formatDate(a.purchaseDate)}</small></td>
      <td><small>${formatDate(a.nextInspection)}</small></td>
      <td>${statusBadge(status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view"   onclick="viewAsset('${a.id}')"   title="View"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit"   onclick="editAsset('${a.id}')"   title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-qr"     onclick="showAssetQR('${a.id}')" title="QR Code"><i class="fas fa-qrcode"></i></button>
          <button class="btn-icon btn-delete" onclick="confirmDelete('${a.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination(pages);
}

function renderPagination(pages) {
  const bar = document.getElementById('paginationBar');
  if (pages <= 1) { bar.innerHTML = ''; return; }
  let html = '';
  html += `<button class="page-btn" onclick="goToPage(${state.currentPage-1})" ${state.currentPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - state.currentPage) <= 2) {
      html += `<button class="page-btn ${i===state.currentPage?'active':''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (Math.abs(i - state.currentPage) === 3) {
      html += `<span style="padding:0 4px;color:var(--text-gray)">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="goToPage(${state.currentPage+1})" ${state.currentPage===pages?'disabled':''}><i class="fas fa-chevron-right"></i></button>`;
  bar.innerHTML = html;
}

function goToPage(p) {
  state.currentPage = p;
  renderAssetTable();
}

function sortBy(key) {
  if (state.sortKey === key) {
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortKey = key;
    state.sortDir = 'asc';
  }
  renderAssetTable();
}

// ─── VIEW ASSET ───────────────────────────────────────────────
function viewAsset(id) {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) return;
  state.viewingAssetId = id;
  const status = getAssetStatus(asset);
  const qrText = getQRContent(asset);
  const isUrl  = qrText.startsWith('http');

  document.getElementById('viewAssetContent').innerHTML = `
    ${asset.image ? `
    <div class="asset-photo-view">
      <img src="${asset.image}" alt="${asset.name}">
    </div>` : ''}
    <div class="asset-detail-grid">
      <div class="detail-item"><label>Asset ID</label><span><code style="color:var(--primary)">${asset.assetId}</code></span></div>
      <div class="detail-item"><label>Asset Name</label><span>${asset.name}</span></div>
      <div class="detail-item"><label>Category</label><span>${asset.category || '—'}</span></div>
      <div class="detail-item"><label>Status</label><span>${statusBadge(status)}</span></div>
      <div class="detail-item"><label>Location</label><span><i class="fas fa-map-marker-alt me-1 text-danger" style="font-size:0.78rem"></i>${asset.location || '—'}</span></div>
      <div class="detail-item"><label>Assigned To</label><span><i class="fas fa-user me-1 text-secondary" style="font-size:0.78rem"></i>${asset.assignedTo || '—'}</span></div>
      <div class="detail-item"><label>Purchase Date</label><span>${formatDate(asset.purchaseDate)}</span></div>
      <div class="detail-item"><label>Invoice Number</label><span>${asset.invoiceNumber || '—'}</span></div>
      <div class="detail-item"><label>Vendor</label><span>${asset.vendor || '—'}</span></div>
      <div class="detail-item"><label>Purchase Value</label><span>${formatCurrency(asset.purchaseValue)}</span></div>
      <div class="detail-item"><label>Product Life</label><span>${asset.productLife ? asset.productLife + ' years' : '—'}</span></div>
      <div class="detail-item"><label>Next Inspection</label><span>${formatDate(asset.nextInspection)}</span></div>
      ${asset.notes ? `<div class="detail-item" style="grid-column:1/-1"><label>Notes</label><span>${asset.notes}</span></div>` : ''}
    </div>
    <div class="detail-qr">
      <img src="${QR_API_SIZE(qrText, 190)}" alt="QR Code" style="border:4px solid #f0f4f8;border-radius:8px">
      <p class="small text-muted mt-2">
        ${isUrl
          ? '<i class="fas fa-mobile-alt me-1 text-success"></i><strong>Scan to open full asset card</strong> — opens in phone browser'
          : '<i class="fas fa-info-circle me-1"></i>Shows text when scanned. Set <em>Asset Viewer URL</em> in Settings to enable mobile card view.'}
      </p>
    </div>`;

  document.getElementById('printLabelBtn').onclick = () => printQRLabel([asset]);
  document.getElementById('editFromViewBtn').onclick = () => {
    bootstrap.Modal.getInstance(document.getElementById('viewAssetModal')).hide();
    editAsset(id);
  };
  new bootstrap.Modal(document.getElementById('viewAssetModal')).show();
}

// ─── ADD / EDIT ASSET ─────────────────────────────────────────
function initAddForm() {
  document.getElementById('editingId').value = '';
  document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle me-2 text-primary" style="font-size:1.2rem"></i>Add New Asset';
  document.getElementById('saveButtonText').textContent = 'Save Asset';
  document.getElementById('assetForm').reset();
  document.getElementById('formQrPreview').innerHTML = '';
  document.getElementById('fPurchaseDate').valueAsDate = new Date();
  removeImage();
}

function editAsset(id) {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) return;
  showSection('addAsset', null);
  document.getElementById('editingId').value    = id;
  document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit me-2 text-primary" style="font-size:1.2rem"></i>Edit Asset';
  document.getElementById('saveButtonText').textContent = 'Update Asset';

  document.getElementById('fAssetId').value      = asset.assetId;
  document.getElementById('fName').value         = asset.name;
  document.getElementById('fCategory').value     = asset.category || 'Electronics';
  document.getElementById('fLocation').value     = asset.location;
  document.getElementById('fPurchaseDate').value = asset.purchaseDate || '';
  document.getElementById('fInvoice').value      = asset.invoiceNumber || '';
  document.getElementById('fVendor').value       = asset.vendor || '';
  document.getElementById('fAssignedTo').value   = asset.assignedTo || '';
  document.getElementById('fProductLife').value  = asset.productLife || '';
  document.getElementById('fNextInspection').value = asset.nextInspection || '';
  document.getElementById('fPurchaseValue').value  = asset.purchaseValue || '';
  document.getElementById('fStatus').value       = asset.status || 'active';
  document.getElementById('fNotes').value        = asset.notes || '';

  // Restore existing image (set AFTER initAddForm which calls removeImage)
  setFormImage(asset.image || null);

  // Show QR preview
  updateFormQR();
}

function saveAsset(e) {
  e.preventDefault();
  const assetId = document.getElementById('fAssetId').value.trim();
  const name    = document.getElementById('fName').value.trim();
  const loc     = document.getElementById('fLocation').value.trim();
  if (!assetId || !name || !loc) { showToast('Please fill all required fields.', 'danger'); return; }

  const editId = document.getElementById('editingId').value;
  const isEdit = !!editId;

  // Check duplicate ID (only for new assets)
  if (!isEdit && state.assets.find(a => a.assetId.toLowerCase() === assetId.toLowerCase())) {
    showToast(`Asset ID "${assetId}" already exists. Please use a unique ID.`, 'danger');
    return;
  }

  const assetData = {
    id:             isEdit ? editId : generateUID(),
    assetId,
    name,
    category:       document.getElementById('fCategory').value,
    location:       loc,
    purchaseDate:   document.getElementById('fPurchaseDate').value || '',
    invoiceNumber:  document.getElementById('fInvoice').value.trim(),
    vendor:         document.getElementById('fVendor').value.trim(),
    assignedTo:     document.getElementById('fAssignedTo').value.trim(),
    productLife:    Number(document.getElementById('fProductLife').value) || 0,
    nextInspection: document.getElementById('fNextInspection').value || '',
    purchaseValue:  Number(document.getElementById('fPurchaseValue').value) || 0,
    status:         document.getElementById('fStatus').value,
    notes:          document.getElementById('fNotes').value.trim(),
    image:          pendingImageData,
    createdAt:      isEdit ? (state.assets.find(a => a.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    updatedAt:      new Date().toISOString(),
  };

  if (isEdit) {
    const idx = state.assets.findIndex(a => a.id === editId);
    state.assets[idx] = assetData;
  } else {
    state.assets.push(assetData);
  }
  saveAssets();
  if (FIREBASE_MODE) fbSaveAsset(assetData);
  showToast(isEdit ? 'Asset updated successfully!' : 'Asset added successfully!', 'success');
  showSection('assetRegister', null);
}

function cancelForm() {
  showSection('assetRegister', null);
}

function autoGenerateId() {
  const prefix = (state.settings.assetPrefix || 'ASSET').toUpperCase();
  const nums = state.assets
    .filter(a => a.assetId.startsWith(prefix + '-'))
    .map(a => parseInt(a.assetId.replace(prefix + '-', '')) || 0);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  document.getElementById('fAssetId').value = `${prefix}-${String(next).padStart(3,'0')}`;
  updateFormQR();
}

function updateFormQR() {
  const idVal   = document.getElementById('fAssetId').value.trim();
  const nameVal = document.getElementById('fName').value.trim();
  if (!idVal) return;
  const preview = document.getElementById('formQrPreview');
  const text = buildQRTextFromFields({ assetId: idVal, name: nameVal });
  preview.innerHTML = `<img src="${QR_API_SIZE(text, 160)}" alt="QR Preview" style="border:4px solid var(--card-bg);border-radius:8px;box-shadow:var(--shadow)">
    <p class="text-muted small mt-2">${idVal}${nameVal ? ' — ' + nameVal : ''}</p>`;
}

// Auto-update QR preview as user types (attached in main DOMContentLoaded)

// ─── DELETE ───────────────────────────────────────────────────
let pendingDeleteId = null;

function confirmDelete(id) {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) return;
  pendingDeleteId = id;
  document.getElementById('deleteAssetName').textContent = `${asset.name} (${asset.assetId})`;
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
  document.getElementById('confirmDeleteBtn').onclick = () => {
    if (FIREBASE_MODE) {
      fbDeleteAsset(pendingDeleteId); // onSnapshot will update state.assets
    } else {
      state.assets = state.assets.filter(a => a.id !== pendingDeleteId);
      saveAssets();
    }
    modal.hide();
    renderAssetTable();
    showToast('Asset deleted successfully.', 'warning');
  };
}

// ─── QR CODES ─────────────────────────────────────────────────
// Unicode-safe base64 encode
function b64encode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16))));
}

// Build minimal asset payload for QR URL (no image — keeps QR small)
function buildQRPayload(asset) {
  return {
    co:  state.settings.companyName || 'SNL',
    id:  asset.assetId,
    n:   asset.name,
    c:   asset.category   || '',
    l:   asset.location   || '',
    a:   asset.assignedTo || '',
    pd:  asset.purchaseDate     || '',
    inv: asset.invoiceNumber    || '',
    v:   asset.vendor           || '',
    pl:  asset.productLife      || 0,
    ni:  asset.nextInspection   || '',
    pv:  asset.purchaseValue    || 0,
    s:   getAssetStatus(asset),
    nt:  asset.notes            || '',
  };
}

// Returns what goes INTO the QR code:
//  • URL mode  → http://192.168.x.x:8080/asset-view.html#ID  (fetches live from Firebase)
//  • Fallback  → http://.../asset-view.html#BASE64_DATA (offline/snapshot view)
function getQRContent(asset) {
  const base = (state.settings.viewerBaseUrl || '').trim().replace(/\/$/, '');
  if (base) {
    if (FIREBASE_MODE) {
      // Live Mode: Pass only the document ID. Mobile viewer will fetch real data.
      return `${base}?id=${asset.id}`;
    }
    // Snapshot Mode: Pass all data in URL (legacy)
    const payload = b64encode(JSON.stringify(buildQRPayload(asset)));
    return `${base}#${payload}`;
  }
  return buildQRText(asset);
}

// Plain-text fallback (used when no server URL is set)
function buildQRText(asset) {
  const co  = state.settings.companyName || 'SNL';
  const div = '─'.repeat(36);
  const lines = [
    `${co} — FIXED ASSET RECORD`, div,
    `ID       : ${asset.assetId}`,
    `NAME     : ${asset.name}`,
    `CATEGORY : ${asset.category || '—'}`, div,
    `LOCATION`, `  ${asset.location || '—'}`, div,
    `ASSIGNED TO`, `  ${asset.assignedTo || '—'}`, div,
    `PURCHASE DATE  : ${formatDate(asset.purchaseDate)}`,
    `INVOICE NO.    : ${asset.invoiceNumber || '—'}`,
    `VENDOR         : ${asset.vendor || '—'}`,
    `PURCHASE VALUE : ${formatCurrency(asset.purchaseValue)}`, div,
    `PRODUCT LIFE   : ${asset.productLife ? asset.productLife + ' years' : '—'}`,
    `NEXT INSPECTION: ${formatDate(asset.nextInspection)}`,
    `STATUS         : ${getAssetStatus(asset).toUpperCase()}`,
  ];
  if (asset.notes) { lines.push(div, `NOTES: ${asset.notes}`); }
  lines.push(div, `Verified by ${co} Asset Management`);
  return lines.join('\n');
}

function buildQRTextFromFields({ assetId, name }) {
  const co   = state.settings.companyName || 'SNL';
  const base = (state.settings.viewerBaseUrl || '').trim().replace(/\/$/, '');
  if (base) {
    const payload = b64encode(JSON.stringify({ co, id: assetId, n: name, l: '', a: '' }));
    return `${base}#${payload}`;
  }
  return `${co} — FIXED ASSET\nID   : ${assetId}\nNAME : ${name}`;
}

// ─── IMAGE HANDLING ───────────────────────────────────────────
let pendingImageData = null;

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) { showToast('Image too large (max 8 MB).', 'danger'); return; }
  resizeImage(file, 700, 700, 0.72).then(dataUrl => {
    pendingImageData = dataUrl;
    document.getElementById('imagePreview').src = dataUrl;
    document.getElementById('imagePreview').style.display = 'block';
    document.getElementById('imageUploadPlaceholder').style.display = 'none';
    document.getElementById('removeImageBtn').style.display = 'inline-block';
    const kb = Math.round(dataUrl.length * 0.75 / 1024);
    showToast(`Photo saved (${kb} KB after compression).`, 'success');
  }).catch(() => showToast('Could not process image.', 'danger'));
}

function resizeImage(file, maxW, maxH, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function removeImage() {
  pendingImageData = null;
  document.getElementById('fImage').value = '';
  document.getElementById('imagePreview').src = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imageUploadPlaceholder').style.display = 'block';
  document.getElementById('removeImageBtn').style.display = 'none';
}

function setFormImage(dataUrl) {
  if (!dataUrl) { removeImage(); return; }
  pendingImageData = dataUrl;
  document.getElementById('imagePreview').src = dataUrl;
  document.getElementById('imagePreview').style.display = 'block';
  document.getElementById('imageUploadPlaceholder').style.display = 'none';
  document.getElementById('removeImageBtn').style.display = 'inline-block';
}

function showAssetQR(id) {
  viewAsset(id); // viewAsset already shows QR
}

function renderQRGrid() {
  const q = (document.getElementById('qrSearch')?.value || '').toLowerCase();
  const filtered = state.assets.filter(a =>
    !q || [a.assetId, a.name, a.location, a.assignedTo].join(' ').toLowerCase().includes(q)
  );
  const grid = document.getElementById('qrGrid');
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-qrcode"></i><p>No assets found</p></div>`;
    return;
  }
  const isUrlMode = !!(state.settings.viewerBaseUrl || '').trim();
  grid.innerHTML = filtered.map(a => {
    const qrText = getQRContent(a);
    return `
    <div class="qr-card">
      ${a.image ? `<img src="${a.image}" class="qr-card-photo" alt="${a.name}" title="${a.name} — photo">` : ''}
      <div class="qr-card-id">${a.assetId}</div>
      <div class="qr-card-name" title="${a.name}">${a.name}</div>
      <div class="qr-card-loc" title="${a.location || ''}"><i class="fas fa-map-marker-alt me-1" style="font-size:0.7rem;color:var(--danger)"></i>${a.location || '—'}</div>
      ${isUrlMode ? `<div style="font-size:0.68rem;color:var(--success);margin-bottom:4px"><i class="fas fa-check-circle me-1"></i>Opens mobile card on scan</div>` : `<div style="font-size:0.68rem;color:var(--text-gray);margin-bottom:4px"><i class="fas fa-info-circle me-1"></i>Text mode — set server URL to enable card view</div>`}
      <img src="${QR_API_SIZE(qrText, 160)}" alt="QR" loading="lazy" onerror="this.style.opacity='0.3'">
      <div class="qr-card-actions">
        <button class="btn btn-sm btn-outline-primary" onclick="viewAsset('${a.id}')"><i class="fas fa-eye me-1"></i>View</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="printQRById('${a.id}')"><i class="fas fa-print me-1"></i>Print</button>
      </div>
    </div>`;
  }).join('');
}

// ─── PRINT QR LABELS ──────────────────────────────────────────
function printQRLabel(assets) {
  const company = state.settings.companyName || 'SNL';
  const labels = assets.map(a => {
    const qrText = getQRContent(a);
    return `
      <div class="qr-label">
        <div class="qr-label-company">${company} — Fixed Asset</div>
        ${a.image ? `<img src="${a.image}" style="width:80px;height:60px;object-fit:cover;border-radius:5px;margin:4px auto;display:block;border:1px solid #ddd" alt="${a.name}">` : ''}
        <img src="${QR_API_SIZE(qrText, 200)}" alt="QR Code">
        <div class="qr-label-id">${a.assetId}</div>
        <div class="qr-label-name">${a.name}</div>
        <div class="qr-label-loc"><b>Location:</b> ${a.location || '—'}</div>
        ${a.assignedTo ? `<div class="qr-label-loc"><b>Assigned:</b> ${a.assignedTo}</div>` : ''}
        <div class="qr-label-scan">Scan QR code for full asset details</div>
      </div>`;
  }).join('');

  const printArea = document.getElementById('qrPrintArea');
  printArea.innerHTML = `
    <div class="print-page">
      <div class="print-title">${company} — Asset QR Labels (${assets.length} labels)</div>
      <div class="print-grid">${labels}</div>
    </div>`;

  // Wait for all QR images to load before printing
  const imgs = Array.from(printArea.querySelectorAll('img'));
  if (!imgs.length) { window.print(); return; }

  showToast(`Loading ${imgs.length} QR image(s)…`, 'info');
  let done = 0;
  let printed = false;
  const doPrint = () => { if (!printed) { printed = true; window.print(); } };
  const tryPrint = () => { done++; if (done >= imgs.length) doPrint(); };
  imgs.forEach(img => {
    if (img.complete) { tryPrint(); }
    else { img.onload = tryPrint; img.onerror = tryPrint; }
  });
  // Fallback: print after 5 s regardless
  setTimeout(doPrint, 5000);
}

function printQRById(id) {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) { showToast('Asset not found.', 'danger'); return; }
  printQRLabel([asset]);
}

function printAllQR() {
  printQRLabel(state.assets);
}

// ─── REPORTS ──────────────────────────────────────────────────
function generateReport(type) {
  const output  = document.getElementById('reportOutput');
  const title   = document.getElementById('reportTitle');
  const content = document.getElementById('reportContent');
  output.style.display = 'block';

  const formatRow = (a) => `
    <tr>
      <td><code style="font-size:0.8rem;color:var(--primary)">${a.assetId}</code></td>
      <td>${a.name}</td>
      <td>${a.category || '—'}</td>
      <td>${a.location || '—'}</td>
      <td>${a.assignedTo || '—'}</td>
      <td>${formatDate(a.purchaseDate)}</td>
      <td>${formatDate(a.nextInspection)}</td>
      <td>${statusBadge(getAssetStatus(a))}</td>
      <td>${formatCurrency(a.purchaseValue)}</td>
    </tr>`;

  const tableHeader = `
    <table class="table table-bordered table-hover table-sm" style="font-size:0.85rem">
      <thead class="table-dark"><tr>
        <th>Asset ID</th><th>Name</th><th>Category</th><th>Location</th>
        <th>Assigned To</th><th>Purchase Date</th><th>Next Inspection</th><th>Status</th><th>Value</th>
      </tr></thead><tbody>`;

  if (type === 'full') {
    title.textContent = `Full Asset Report (${state.assets.length} assets)`;
    content.innerHTML = tableHeader + state.assets.map(formatRow).join('') + '</tbody></table>';
  }

  if (type === 'inspection') {
    title.textContent = 'Inspection Report — Due & Overdue';
    const due = state.assets.filter(a => ['due','overdue'].includes(getAssetStatus(a)))
      .sort((a,b) => new Date(a.nextInspection) - new Date(b.nextInspection));
    content.innerHTML = due.length
      ? tableHeader + due.map(formatRow).join('') + '</tbody></table>'
      : '<p class="text-muted">No assets currently due or overdue for inspection.</p>';
  }

  if (type === 'location') {
    title.textContent = 'Location-wise Asset Report';
    const byLoc = {};
    state.assets.forEach(a => { (byLoc[a.location || 'Unknown'] = byLoc[a.location || 'Unknown'] || []).push(a); });
    content.innerHTML = Object.entries(byLoc).map(([loc, assets]) => `
      <h6 class="fw-bold text-primary mt-3"><i class="fas fa-map-marker-alt me-2"></i>${loc} (${assets.length})</h6>
      ${tableHeader + assets.map(formatRow).join('') + '</tbody></table>'}`).join('');
  }

  if (type === 'category') {
    title.textContent = 'Category-wise Asset Report';
    const byCat = {};
    state.assets.forEach(a => { (byCat[a.category || 'Other'] = byCat[a.category || 'Other'] || []).push(a); });
    content.innerHTML = Object.entries(byCat).map(([cat, assets]) => `
      <h6 class="fw-bold text-primary mt-3"><i class="fas fa-tags me-2"></i>${cat} (${assets.length})</h6>
      ${tableHeader + assets.map(formatRow).join('') + '</tbody></table>'}`).join('');
  }

  if (type === 'value') {
    title.textContent = 'Asset Value Report';
    const byCat = {};
    let grandTotal = 0;
    state.assets.forEach(a => {
      const cat = a.category || 'Other';
      if (!byCat[cat]) byCat[cat] = { count: 0, value: 0 };
      byCat[cat].count++;
      byCat[cat].value += Number(a.purchaseValue) || 0;
      grandTotal += Number(a.purchaseValue) || 0;
    });
    content.innerHTML = `
      <table class="table table-bordered table-hover">
        <thead class="table-dark"><tr><th>Category</th><th>Count</th><th>Total Value</th><th>% of Total</th></tr></thead>
        <tbody>
          ${Object.entries(byCat).map(([cat, d]) => `<tr>
            <td>${cat}</td><td>${d.count}</td>
            <td>${formatCurrency(d.value)}</td>
            <td>${grandTotal ? (d.value/grandTotal*100).toFixed(1) + '%' : '0%'}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr class="fw-bold"><td>Total</td><td>${state.assets.length}</td><td>${formatCurrency(grandTotal)}</td><td>100%</td></tr></tfoot>
      </table>`;
  }

  output.scrollIntoView({ behavior: 'smooth' });
}

function printReport() {
  const content = document.getElementById('reportContent').innerHTML;
  const title   = document.getElementById('reportTitle').textContent;
  const company = state.settings.companyName || 'SNL';
  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <style>body{padding:20px;font-size:12px}.table td,.table th{padding:4px 8px}</style>
  </head><body>
    <h5 class="text-center">${company} — ${title}</h5>
    <p class="text-center text-muted" style="font-size:11px">Generated: ${new Date().toLocaleDateString('en-IN')}</p>
    <hr>${content}
  </body></html>`);
  w.document.close();
  w.print();
}

// ─── EXPORT ───────────────────────────────────────────────────
function exportCSV() {
  const headers = ['Asset ID','Name','Category','Location','Assigned To','Purchase Date','Invoice No.','Vendor','Product Life (Yrs)','Next Inspection','Purchase Value','Status','Notes'];
  const rows = state.assets.map(a => [
    a.assetId, a.name, a.category, a.location, a.assignedTo,
    a.purchaseDate, a.invoiceNumber, a.vendor, a.productLife,
    a.nextInspection, a.purchaseValue, getAssetStatus(a), a.notes
  ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
  const csv  = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, `${state.settings.companyName || 'SNL'}_Assets_${yyyymmdd()}.csv`, 'text/csv');
  showToast('CSV exported successfully!', 'success');
}

function exportJSON() {
  downloadFile(JSON.stringify(state.assets, null, 2), `${state.settings.companyName || 'SNL'}_Assets_${yyyymmdd()}.json`, 'application/json');
  showToast('JSON exported successfully!', 'success');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid format');
      const merged = [...state.assets];
      const toAdd = [];
      let added = 0;
      data.forEach(a => {
        if (a.assetId && !merged.find(x => x.assetId === a.assetId)) {
          const asset = { ...a, id: a.id || generateUID() };
          merged.push(asset);
          toAdd.push(asset);
          added++;
        }
      });
      state.assets = merged;
      saveAssets();
      if (FIREBASE_MODE) toAdd.forEach(a => fbSaveAsset(a));
      showToast(`Import successful! ${added} new assets added.`, 'success');
      renderAssetTable();
    } catch {
      showToast('Invalid JSON file. Please export from this app first.', 'danger');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ─── PRINT ASSET LIST ─────────────────────────────────────────
function printAssetList() {
  const company = state.settings.companyName || 'SNL';
  const rows = getFilteredAssets().map(a => `<tr>
    <td>${a.assetId}</td><td>${a.name}</td><td>${a.category||'—'}</td>
    <td>${a.location||'—'}</td><td>${a.assignedTo||'—'}</td>
    <td>${formatDate(a.purchaseDate)}</td><td>${formatDate(a.nextInspection)}</td>
    <td>${getAssetStatus(a)}</td>
  </tr>`).join('');
  const w = window.open('', '_blank', 'width=1000,height=700');
  w.document.write(`<!DOCTYPE html><html><head>
    <title>Asset Register</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <style>body{padding:20px;font-size:11px}.table td,.table th{padding:3px 6px}</style>
  </head><body>
    <h5>${company} — Asset Register</h5>
    <p class="text-muted" style="font-size:10px">Printed: ${new Date().toLocaleDateString('en-IN')}</p>
    <table class="table table-bordered table-sm">
      <thead class="table-dark"><tr><th>Asset ID</th><th>Name</th><th>Category</th><th>Location</th><th>Assigned To</th><th>Purchase Date</th><th>Next Inspection</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`);
  w.document.close();
  w.print();
}

// ─── SETTINGS ─────────────────────────────────────────────────
function saveSettings() {
  state.settings.companyName    = document.getElementById('companyName').value.trim() || 'SNL';
  state.settings.assetPrefix    = document.getElementById('assetPrefix').value.trim() || 'ASSET';
  state.settings.perPage        = parseInt(document.getElementById('perPageSetting').value) || 10;
  state.settings.viewerBaseUrl  = document.getElementById('viewerBaseUrl').value.trim();
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  if (FIREBASE_MODE && db) {
    db.collection('config').doc('settings').set(state.settings)
      .catch(e => console.warn('Settings cloud sync:', e.message));
  }
  document.querySelector('.sidebar-logo span').textContent = state.settings.companyName + ' Assets';
  const urlSet = !!state.settings.viewerBaseUrl;
  showToast('Settings saved!' + (urlSet ? ' QR codes will now open mobile card view.' : ''), 'success');
}

function testViewerUrl() {
  const url = document.getElementById('viewerBaseUrl').value.trim();
  if (!url) { showToast('Enter a URL first.', 'danger'); return; }
  window.open(url + '#eyJpZCI6IlRFU1QtMDAxIiwibiI6IlRlc3QgQXNzZXQiLCJsIjoiU05MIE1haW4gT2ZmaWNlIiwiYSI6IkFkbWluIiwicyI6ImFjdGl2ZSIsImNvIjoiU05MIn0=', '_blank');
  showToast('Opened test page in new tab. If it loads, your URL is correct!', 'info');
}

function changePassword(e) {
  e.preventDefault();
  const current  = document.getElementById('currentPwd').value;
  const newPwd   = document.getElementById('newPwd').value;
  const confirm  = document.getElementById('confirmPwd').value;
  const username = state.session?.username || document.getElementById('sidebarUsername').textContent;
  const user     = state.users.find(u => u.username === username);
  if (!user || user.password !== current) { showToast('Current password is incorrect.', 'danger'); return; }
  if (newPwd.length < 4) { showToast('New password must be at least 4 characters.', 'danger'); return; }
  if (newPwd !== confirm)  { showToast('Passwords do not match.', 'danger'); return; }
  user.password = newPwd;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
  showToast('Password changed successfully!', 'success');
  document.getElementById('currentPwd').value = '';
  document.getElementById('newPwd').value = '';
  document.getElementById('confirmPwd').value = '';
}

function loadSampleData() {
  if (!confirm('This will add sample assets to your register. Continue?')) return;
  let added = 0;
  const toAdd = [];
  SAMPLE_ASSETS.forEach(a => {
    if (!state.assets.find(x => x.assetId === a.assetId)) {
      state.assets.push({ ...a });
      toAdd.push({ ...a });
      added++;
    }
  });
  saveAssets();
  if (FIREBASE_MODE) toAdd.forEach(a => fbSaveAsset(a));
  showToast(`${added} sample assets loaded!`, 'success');
}

function clearAllData() {
  if (!confirm('Are you sure? This will delete ALL assets permanently and cannot be undone!')) return;
  if (FIREBASE_MODE) {
    const ids = state.assets.map(a => a.id);
    ids.forEach(id => fbDeleteAsset(id));
    // onSnapshot will clear state.assets
  } else {
    state.assets = [];
    saveAssets();
    initDashboard();
  }
  showToast('All data cleared.', 'warning');
}

async function syncLocalToCloud() {
  if (!FIREBASE_MODE || !db) {
    showToast('Firebase is not initialized. Please check your config.', 'danger');
    return;
  }
  
  if (fbAuth && !fbAuth.currentUser) {
    showToast('You must be signed in to sync data to the cloud.', 'danger');
    return;
  }

  // Get assets directly from localStorage to avoid cloud data overwriting local registry
  const localAssets = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || 'null') || SAMPLE_ASSETS;
  const total = localAssets.length;

  if (total === 0) {
    showToast('No local assets found to sync.', 'info');
    return;
  }

  if (!confirm(`Found ${total} assets in local storage. Sync them to the cloud? Existing records will be updated.`)) return;
  
  showToast(`Syncing ${total} assets to cloud...`, 'info');
  let success = 0;
  let failed = 0;
  let lastError = null;

  for (const asset of localAssets) {
    try {
      await db.collection('assets').doc(asset.id).set(asset);
      success++;
    } catch (e) {
      console.error('Sync failed for:', asset.id, e);
      failed++;
      lastError = e.message;
    }
  }

  if (failed === 0) {
    showToast(`Successfully synced ${success} assets to cloud!`, 'success');
  } else {
    const errorHint = lastError && lastError.toLowerCase().includes('permission-denied') 
      ? 'Firestore Permission Denied — check your Rules.' 
      : (lastError || 'Unknown error');
    showToast(`Sync partially failed: ${failed} error(s). ${errorHint}`, 'danger');
    console.error('Final Sync Error:', lastError);
  }
}

// ─── UTILITIES ────────────────────────────────────────────────
function generateUID() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function yyyymmdd() {
  return new Date().toISOString().slice(0,10).replace(/-/g,'');
}

function showToast(msg, type = 'success') {
  const toast   = document.getElementById('appToast');
  const toastEl = document.getElementById('toastMsg');
  toastEl.textContent = msg;
  const colours = { success: '#27ae60', danger: '#e74c3c', warning: '#e67e22', info: '#2980b9' };
  toast.style.background = colours[type] || colours.info;
  new bootstrap.Toast(toast, { delay: 3500 }).show();
}
