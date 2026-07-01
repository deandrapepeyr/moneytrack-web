"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Tag,
  FileText,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useTheme } from "@/lib/ThemeContext";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type Category = {
  category_id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
};

type Transaction = {
  id?: string;
  name?: string;
  description?: string;
  type: "INCOME" | "OUTCOME";
  amount: number;
  category_name: string;
  date: string;
};

type FilterState = {
  search: string;
  type: "ALL" | "INCOME" | "OUTCOME";
  month: number;
  year: number;
  date?: string;
};

export default function TransactionsPage() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    type: "ALL",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: "",
  });
  const [showFilter, setShowFilter] = useState(false);
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<"INCOME" | "OUTCOME">("OUTCOME");
  const [formAmount, setFormAmount] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Try loading from cache first
      const cachedTxns = localStorage.getItem("cached_transactions");
      const cachedCats = localStorage.getItem("cached_categories");
      
      if (cachedTxns) setTransactions(JSON.parse(cachedTxns));
      if (cachedCats) setApiCategories(JSON.parse(cachedCats));
      if (cachedTxns && cachedCats) setIsLoading(false);

      const [txnsRes, catsRes] = await Promise.all([
        api.get("dashboard/recent", { limit: "100" }),
        api.get("categories/list")
      ]);

      if (txnsRes.data) {
        setTransactions(txnsRes.data);
        localStorage.setItem("cached_transactions", JSON.stringify(txnsRes.data));
      }
      if (catsRes.data) {
        setApiCategories(catsRes.data);
        localStorage.setItem("cached_categories", JSON.stringify(catsRes.data));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Type filter
      if (filter.type !== "ALL" && txn.type !== filter.type) return false;

      // Search filter
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const name = (txn.name || txn.description || "").toLowerCase();
        const cat = (txn.category_name || "").toLowerCase();
        if (!name.includes(query) && !cat.includes(query)) return false;
      }

      // Date filter
      if (filter.date && txn.date !== filter.date) return false;

      // Month/Year filter (only apply if exact date is not set)
      if (!filter.date) {
        const txnDate = new Date(txn.date);
        if (txnDate.getMonth() + 1 !== filter.month || txnDate.getFullYear() !== filter.year) return false;
      }

      return true;
    });
  }, [transactions, filter]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sorted.forEach((txn) => {
      const dateKey = txn.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(txn);
    });

    return groups;
  }, [filteredTransactions]);

  const totalIncome = useMemo(
    () => filteredTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );
  const totalExpense = useMemo(
    () => filteredTransactions.filter((t) => t.type === "OUTCOME").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formName || !formCategory) {
      setFormError("Semua field harus diisi.");
      return;
    }

    setFormError("");

    const amountNum = parseFloat(formAmount.replace(/\./g, ""));
    const categoryName = apiCategories.find(c => c.category_id === formCategory)?.name || "Lainnya";

    // 1. Buat data transaksi sementara untuk Optimistic UI
    const tempTxn: Transaction = {
      id: editingTxnId || ("temp-" + Date.now()),
      name: formName,
      description: formName,
      type: formType,
      amount: amountNum,
      category_name: categoryName,
      date: formDate,
    };

    // 2. Langsung masukkan ke list tanpa delay sedikitpun!
    if (editingTxnId) {
      setTransactions(prev => prev.map(t => t.id === editingTxnId ? tempTxn : t));
    } else {
      setTransactions(prev => [tempTxn, ...prev]);
    }
    setShowAddModal(false);
    resetForm();

    // 3. Proses pengiriman ke server di belakang layar (tanpa ditunggu!)
    const actionStr = editingTxnId ? "transactions/update" : "transactions/create";
    api.post(actionStr, {
      id: editingTxnId,
      type: formType,
      amount: amountNum,
      description: formName,
      category_id: formCategory,
      date: formDate,
    }).catch((err: any) => {
      // Kalau gagal, kita fetch ulang untuk mengembalikan state semula
      alert(`Gagal menyimpan transaksi ke server: ${err.message || "Error"}`);
      fetchData(true);
    });
  };

  const handleDelete = () => {
    if (!editingTxnId) return;
    const confirmDelete = window.confirm("Yakin ingin menghapus transaksi ini?");
    if (!confirmDelete) return;

    // Optimistic Delete
    setTransactions(prev => prev.filter(t => t.id !== editingTxnId));
    setShowAddModal(false);
    resetForm();

    api.post("transactions/delete", { id: editingTxnId })
      .catch((err: any) => {
        alert(`Gagal menghapus transaksi: ${err.message || "Error"}`);
        fetchData(true);
      });
  };

  const handleEditClick = (txn: Transaction) => {
    setEditingTxnId(txn.id || null);
    setFormType(txn.type);
    setFormAmount(txn.amount.toLocaleString("id-ID"));
    setFormName(txn.name || txn.description || "");
    
    const catId = apiCategories.find(c => c.name === txn.category_name)?.category_id || "";
    setFormCategory(catId);
    
    // Pastikan format date YYYY-MM-DD
    setFormDate(txn.date.substring(0, 10));
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingTxnId(null);
    setFormType("OUTCOME");
    setFormAmount("");
    setFormName("");
    setFormCategory("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setFormSuccess(false);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hari Ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";

    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const daysInMonth = useMemo(() => {
    const days = [];
    const date = new Date(filter.year, filter.month - 1, 1);
    while (date.getMonth() === filter.month - 1) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });
      
      days.push({
        dateString,
        dayName,
        dayNumber: date.getDate(),
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [filter.month, filter.year]);

  // Demo data when API returns nothing
  const demoTransactions: Transaction[] = [
    { name: "Gaji bulanan", type: "INCOME", amount: 6200000, category_name: "Salary", date: "2026-06-30" },
    { name: "Belanja bulanan", type: "OUTCOME", amount: 850000, category_name: "Groceries", date: "2026-06-30" },
    { name: "Listrik & air", type: "OUTCOME", amount: 420000, category_name: "Utilities", date: "2026-06-28" },
    { name: "Freelance project", type: "INCOME", amount: 1500000, category_name: "Freelance", date: "2026-06-28" },
    { name: "Makan di luar", type: "OUTCOME", amount: 275000, category_name: "Food", date: "2026-06-25" },
    { name: "Bensin motor", type: "OUTCOME", amount: 50000, category_name: "Transport", date: "2026-06-25" },
    { name: "Nonton bioskop", type: "OUTCOME", amount: 75000, category_name: "Entertainment", date: "2026-06-22" },
    { name: "Transfer dari teman", type: "INCOME", amount: 300000, category_name: "Gift", date: "2026-06-22" },
    { name: "Obat-obatan", type: "OUTCOME", amount: 150000, category_name: "Health", date: "2026-06-20" },
    { name: "Beli buku", type: "OUTCOME", amount: 120000, category_name: "Education", date: "2026-06-20" },
  ];

  const displayTransactions = transactions.length > 0 ? transactions : demoTransactions;

  const displayFiltered = useMemo(() => {
    return displayTransactions.filter((txn) => {
      if (filter.type !== "ALL" && txn.type !== filter.type) return false;
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const name = (txn.name || txn.description || "").toLowerCase();
        const cat = (txn.category_name || "").toLowerCase();
        if (!name.includes(query) && !cat.includes(query)) return false;
      }
      
      if (filter.date && txn.date !== filter.date) return false;
      
      return true;
    });
  }, [displayTransactions, filter]);

  const displayGrouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const sorted = [...displayFiltered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    sorted.forEach((txn) => {
      const dateKey = txn.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(txn);
    });
    return groups;
  }, [displayFiltered]);

  const displayTotalIncome = useMemo(
    () => displayFiltered.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
    [displayFiltered]
  );
  const displayTotalExpense = useMemo(
    () => displayFiltered.filter((t) => t.type === "OUTCOME").reduce((s, t) => s + t.amount, 0),
    [displayFiltered]
  );

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in duration-500 flex flex-col gap-5">

      {/* Slicing 1: Summary Mini */}
      <div className={`${
        theme === "feminine" ? "bg-fuchsia-50/50 border-fuchsia-100" : "bg-slate-50 border-slate-200"
      } border rounded-[20px] p-4 flex items-center justify-between shadow-sm transition-colors duration-500`}>
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Total Balance</span>
          <span className="text-[16px] font-bold text-slate-900">{formatIDR(displayTotalIncome - displayTotalExpense)}</span>
        </div>
        <div className="w-px h-8 bg-slate-200 mx-2" />
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Pemasukan</span>
          <span className="text-[14px] font-bold text-emerald-600">+{formatIDR(displayTotalIncome)}</span>
        </div>
        <div className="w-px h-8 bg-slate-200 mx-2" />
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Pengeluaran</span>
          <span className="text-[14px] font-bold text-rose-600">-{formatIDR(displayTotalExpense)}</span>
        </div>
      </div>

      {/* Slicing 2: Action Button Cards */}
      <div className="grid grid-cols-2 gap-3 lg:gap-5">
        <button
          onClick={() => { resetForm(); setFormType("INCOME"); setShowAddModal(true); }}
          className={`${
            theme === "feminine" ? "bg-pink-50/60 border-pink-100 hover:border-pink-300 hover:bg-pink-100/60" : "bg-emerald-50/60 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/60"
          } border rounded-[20px] p-4 flex items-center gap-3 transition-all duration-500 text-left shadow-sm group`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${
            theme === "feminine" ? "bg-pink-200/80" : "bg-emerald-100/80"
          }`}>
            <Plus className={`w-5 h-5 ${theme === "feminine" ? "text-pink-600" : "text-emerald-600"}`} />
          </div>
          <div>
            <p className="text-[13px] md:text-[14px] font-bold text-slate-900">Add Pemasukan</p>
            <p className="text-[11px] text-slate-500 hidden md:block">Catat pendapatan baru</p>
          </div>
        </button>

        <button
          onClick={() => { resetForm(); setFormType("OUTCOME"); setShowAddModal(true); }}
          className={`${
            theme === "feminine" ? "bg-fuchsia-50/60 border-fuchsia-100 hover:border-fuchsia-300 hover:bg-fuchsia-100/60" : "bg-rose-50/60 border-rose-100 hover:border-rose-300 hover:bg-rose-100/60"
          } border rounded-[20px] p-4 flex items-center gap-3 transition-all duration-500 text-left shadow-sm group`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${
            theme === "feminine" ? "bg-fuchsia-200/80" : "bg-rose-100/80"
          }`}>
            <Plus className={`w-5 h-5 ${theme === "feminine" ? "text-fuchsia-600" : "text-rose-600"}`} />
          </div>
          <div>
            <p className="text-[13px] md:text-[14px] font-bold text-slate-900">Add Pengeluaran</p>
            <p className="text-[11px] text-slate-500 hidden md:block">Catat pengeluaran baru</p>
          </div>
        </button>
      </div>

      {/* Slicing 3: Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className={`flex-1 flex items-center gap-2 border rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 transition-all duration-500 ${
          theme === "feminine" ? "bg-fuchsia-50 border-fuchsia-100 focus-within:border-fuchsia-300 focus-within:ring-fuchsia-100" : "bg-slate-50 border-slate-200 focus-within:border-slate-400 focus-within:ring-slate-100"
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="flex-1 text-[13px] text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          />
          {filter.search && (
            <button onClick={() => setFilter((f) => ({ ...f, search: "" }))} className="p-0.5 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2.5 rounded-2xl border shadow-sm transition-all duration-500 ${
            showFilter || filter.type !== "ALL"
              ? (theme === "feminine" ? "bg-fuchsia-700 border-fuchsia-700 text-white" : "bg-slate-800 border-slate-800 text-white")
              : (theme === "feminine" ? "bg-fuchsia-50 border-fuchsia-100 text-slate-500 hover:border-fuchsia-300" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300")
          }`}
        >
          <Filter className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Filter Chips & Month/Year */}
      {showFilter && (
        <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2">
            {(["ALL", "INCOME", "OUTCOME"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter((f) => ({ ...f, type }))}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
                  filter.type === type
                    ? type === "INCOME"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : type === "OUTCOME"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                      : "bg-[#5b4fe0] text-white shadow-md shadow-indigo-500/25"
                    : "bg-white border border-[#e9e9f2] text-[#6b6d80] hover:border-[#c0c0d0]"
                }`}
              >
                {type === "ALL" ? "Semua" : type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-white ${
              theme === "feminine" ? "border-fuchsia-100" : "border-slate-200"
            }`}>
              <Calendar className={`w-4 h-4 ${theme === "feminine" ? "text-fuchsia-500" : "text-slate-400"}`} />
              <select 
                value={filter.month}
                onChange={(e) => setFilter(f => ({ ...f, month: parseInt(e.target.value), date: "" }))}
                className="text-[12px] text-slate-700 outline-none bg-transparent font-medium cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select 
                value={filter.year}
                onChange={(e) => setFilter(f => ({ ...f, year: parseInt(e.target.value), date: "" }))}
                className="text-[12px] text-slate-700 outline-none bg-transparent font-medium cursor-pointer"
              >
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Date Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setFilter(f => ({ ...f, date: "" }))}
          className={`flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-2xl border transition-all ${
            !filter.date
              ? (theme === "feminine" ? "bg-fuchsia-600 border-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30" : "bg-slate-800 border-slate-800 text-white shadow-md shadow-slate-500/30")
              : (theme === "feminine" ? "bg-white border-fuchsia-100 text-slate-400 hover:border-fuchsia-300" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300")
          }`}
        >
          <span className="text-[10px] font-bold">Semua</span>
        </button>
        
        {(() => {
          const todayDate = new Date();
          const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
          
          return daysInMonth.map((day) => {
            const isSelected = filter.date === day.dateString;
            const isToday = day.dateString === todayStr;
            return (
              <button
                key={day.dateString}
                onClick={() => setFilter(f => ({ ...f, date: day.dateString }))}
                className={`relative flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-2xl border transition-all ${
                  isSelected
                    ? (theme === "feminine" ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/30" : "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30")
                    : (theme === "feminine" ? "bg-white border-fuchsia-100 text-slate-600 hover:border-fuchsia-300 hover:bg-fuchsia-50/50" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50")
                }`}
              >
                <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${isSelected ? "text-white/80" : "text-slate-400"}`}>{day.dayName}</span>
                <span className="text-[14px] font-bold">{day.dayNumber}</span>
                {isToday && (
                  <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : (theme === "feminine" ? "bg-pink-500" : "bg-indigo-600")}`} />
                )}
              </button>
            );
          });
        })()}
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-[13px] text-[#9a9cae] font-medium">Memuat transaksi...</p>
        </div>
      ) : Object.keys(displayGrouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#9a9cae]" />
          </div>
          <p className="text-[14px] font-semibold text-[#181825]">Belum ada transaksi</p>
          <p className="text-[12px] text-[#9a9cae]">Tap tombol + untuk menambahkan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(displayGrouped).map(([date, txns]) => (
            <div key={date} className={`${
              theme === "feminine" ? "bg-fuchsia-50/50 border-fuchsia-100" : "bg-slate-50/50 border-slate-200"
            } border rounded-[24px] shadow-sm overflow-hidden transition-colors duration-500`}>
              {/* Date Header */}
              <div className={`px-5 py-3 border-b transition-colors duration-500 ${
                theme === "feminine" ? "border-fuchsia-100 bg-fuchsia-50/80" : "border-[#f0f0f5] bg-[#fafafe]"
              }`}>
                <p className="text-[12px] font-bold text-[#6b6d80] uppercase tracking-wide">
                  {formatDateLabel(date)}
                </p>
              </div>

              {/* Transactions */}
              <div className="flex flex-col">
                {txns.map((txn, idx) => {
                  const isIncome = txn.type === "INCOME";
                  return (
                    <div
                      key={idx}
                      onClick={() => handleEditClick(txn)}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        idx !== txns.length - 1 ? "border-b border-[#f0f0f5]" : ""
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm transition-transform group-hover:scale-105 ${
                          isIncome
                            ? "bg-gradient-to-br from-[#0ecf8f] to-[#08a873]"
                            : "bg-gradient-to-br from-[#ff4d6d] to-[#e11d48]"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-[#181825] truncate group-hover:text-[#5b4fe0] transition-colors">
                          {txn.name || txn.description}
                        </h4>
                        <p className="text-[11px] text-[#9a9cae] mt-0.5 font-medium">
                          {txn.category_name}
                        </p>
                      </div>

                      <div
                        className={`text-[13px] font-bold shrink-0 ${
                          isIncome ? "text-[#08a873]" : "text-[#e11d48]"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatIDR(txn.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => { setShowAddModal(false); resetForm(); }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] p-6 animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Handle bar (mobile) */}
            <div className="md:hidden w-10 h-1 bg-[#d0d0dd] rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-bold text-[#181825]">
                {editingTxnId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-[#6b6d80]" />
              </button>
            </div>

            {formSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-[15px] font-bold text-[#181825]">Berhasil Ditambahkan!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Type Toggle */}
                <div className="flex bg-[#f4f5fa] rounded-2xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => { setFormType("OUTCOME"); setFormCategory(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      formType === "OUTCOME"
                        ? (theme === "feminine" ? "bg-fuchsia-600 text-white shadow-md" : "bg-rose-600 text-white shadow-md")
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType("INCOME"); setFormCategory(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      formType === "INCOME"
                        ? (theme === "feminine" ? "bg-pink-500 text-white shadow-md" : "bg-emerald-600 text-white shadow-md")
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6d80] mb-2 uppercase tracking-wide">
                    <DollarSign className="w-3.5 h-3.5" />
                    Jumlah
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      if (rawValue) {
                        setFormAmount(parseInt(rawValue, 10).toLocaleString("id-ID"));
                      } else {
                        setFormAmount("");
                      }
                    }}
                    className="w-full text-[24px] font-bold text-[#181825] placeholder:text-[#d0d0dd] bg-[#f4f5fa] rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#7c6ff2]/20 border border-transparent focus:border-[#7c6ff2] transition-all"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6d80] mb-2 uppercase tracking-wide">
                    <FileText className="w-3.5 h-3.5" />
                    Keterangan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Makan siang"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-[14px] text-[#181825] placeholder:text-[#b0b0c0] bg-[#f4f5fa] rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#7c6ff2]/20 border border-transparent focus:border-[#7c6ff2] transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6d80] mb-2 uppercase tracking-wide">
                    <Tag className="w-3.5 h-3.5" />
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-[14px] text-[#181825] bg-[#f4f5fa] rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#7c6ff2]/20 border border-transparent focus:border-[#7c6ff2] transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Pilih kategori</option>
                      {apiCategories
                        .filter((cat) => cat.type === formType)
                        .map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9cae] pointer-events-none" />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6b6d80] mb-2 uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" />
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-[14px] text-[#181825] bg-[#f4f5fa] rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#7c6ff2]/20 border border-transparent focus:border-[#7c6ff2] transition-all"
                  />
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 text-[12px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Submit & Delete */}
                <div className="flex gap-3">
                  {editingTxnId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-5 py-3.5 rounded-2xl text-[14px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className={`flex-1 py-3.5 rounded-2xl text-[14px] font-bold text-white shadow-lg transition-all duration-500 active:scale-[0.98] ${
                      formType === "INCOME"
                        ? (theme === "feminine" ? "bg-pink-500 shadow-pink-500/25 hover:shadow-pink-500/40" : "bg-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40")
                        : (theme === "feminine" ? "bg-fuchsia-600 shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40" : "bg-rose-600 shadow-rose-500/25 hover:shadow-rose-500/40")
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {formSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </span>
                    ) : (
                      "Simpan Transaksi"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
