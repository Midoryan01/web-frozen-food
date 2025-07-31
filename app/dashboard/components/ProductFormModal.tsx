"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { XCircle, UploadCloud, ImageOff } from "lucide-react";
import type { Product, Category } from "../types"; // Impor tipe

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
  apiBaseUrl: string;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSave,
  apiBaseUrl,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    description: "",
    supplier: "", // Jika supplier hanya string
    expiryDate: "", // Format YYYY-MM-DD
    categoryId: "" as string | number,
    // imageUrl akan di-handle terpisah dengan imageFile dan currentImageUrl
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    product?.imageUrl || null
  ); // Untuk menampilkan gambar yang ada
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl || null
  ); // Untuk preview gambar baru
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        buyPrice: Number(product.buyPrice) || 0,
        sellPrice: Number(product.sellPrice) || 0,
        stock: Number(product.stock) || 0,
        description: product.description || "",
        supplier: product.supplier || "",
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate).toISOString().split("T")[0]
          : "",
        categoryId: product.categoryId || "",
      });
      setCurrentImageUrl(product.imageUrl || null);
      setImagePreview(product.imageUrl || null);
      setImageFile(null); // Reset file jika membuka produk yang sudah ada
    } else {
      // Reset form untuk produk baru
      setFormData({
        name: "",
        sku: "",
        buyPrice: 0,
        sellPrice: 0,
        stock: 0,
        description: "",
        supplier: "",
        expiryDate: "",
        categoryId: "",
      });
      setCurrentImageUrl(null);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number = value;
    if (type === "number") {
      processedValue = value === "" ? "" : Number(value); // Biarkan kosong jika input dikosongkan, atau konversi ke angka
    }
    if (name === "categoryId" && value === "") {
      processedValue = ""; // Untuk opsi "Pilih Kategori"
    } else if (name === "categoryId") {
      processedValue = Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Buat preview untuk gambar yang baru dipilih
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // setCurrentImageUrl(null); // Jika gambar baru dipilih, gambar lama tidak relevan lagi untuk preview
    } else {
      setImageFile(null);
      setImagePreview(currentImageUrl); // Kembali ke gambar saat ini jika pemilihan file dibatalkan
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Jika ini mode edit, kita perlu cara untuk memberitahu backend agar menghapus gambar
    // Untuk sekarang, ini hanya menghapus preview dan file yang dipilih.
    // Backend perlu logika untuk menghapus imageUrl jika tidak ada imageFile baru dan `removeCurrentImage` dikirim.
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submissionData = new FormData(); // Gunakan FormData untuk file upload

    // Append semua field teks, pastikan konversi tipe benar
    submissionData.append("name", formData.name);
    if (formData.sku) submissionData.append("sku", formData.sku);
    submissionData.append("buyPrice", String(formData.buyPrice));
    submissionData.append("sellPrice", String(formData.sellPrice));
    submissionData.append("stock", String(formData.stock));
    if (formData.description)
      submissionData.append("description", formData.description);
    if (formData.supplier) submissionData.append("supplier", formData.supplier);
    submissionData.append("expiryDate", formData.expiryDate);
    if (formData.categoryId && formData.categoryId !== "") {
      submissionData.append("categoryId", String(formData.categoryId));
    }

    // Handle file gambar
    if (imageFile) {
      submissionData.append("image", imageFile); // Backend akan menerima ini sebagai 'image'
    } else if (!imagePreview && product && product.imageUrl) {
      // Jika imagePreview di-null-kan (melalui handleRemoveImage) dan ada gambar lama,
      // kirim flag untuk menghapus gambar yang ada di backend.
      submissionData.append("removeCurrentImage", "true");
    }

    // Debugging: lihat apa yang dikirim
    // for (let pair of submissionData.entries()) {
    //   console.log(pair[0]+ ', ' + pair[1]);
    // }

    try {
      const url = product
        ? `${apiBaseUrl}/products/${product.id}`
        : `${apiBaseUrl}/products`;
      const method = product ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: submissionData, // Tidak perlu header Content-Type manual untuk FormData
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: `Gagal ${
              product ? "memperbarui" : "menambah"
            } produk. Respons server tidak valid.`,
          }));
        throw new Error(
          errorData.message ||
            `Gagal ${product ? "memperbarui" : "menambah"} produk`
        );
      }

      // const result = await response.json();
      // alert(result.message || `Produk berhasil ${product ? 'diperbarui' : 'ditambahkan'}!`);
      alert(`Produk berhasil ${product ? "diperbarui" : "ditambahkan"}!`);
      onSave(); // Panggil fungsi onSave dari parent untuk refresh data dan tutup modal
    } catch (e: any) {
      console.error("Error submitting product:", e);
      setError(e.message);
      // Jangan tutup modal jika error agar user bisa koreksi
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle size={28} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow"
        >
          {/* Nama Produk */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nama Produk*
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
            />
          </div>

          {/* Harga Beli & Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="buyPrice"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Harga Beli*
              </label>
              <input
                type="number"
                name="buyPrice"
                id="buyPrice"
                value={formData.buyPrice}
                onChange={handleChange}
                required
                min="0"
                step="any"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              />
            </div>
            <div>
              <label
                htmlFor="sellPrice"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Harga Jual*
              </label>
              <input
                type="number"
                name="sellPrice"
                id="sellPrice"
                value={formData.sellPrice}
                onChange={handleChange}
                required
                min="0"
                step="any"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              />
            </div>
          </div>

          {/* Stok & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Stok Awal/Saat Ini*
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              />
            </div>
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Kategori
              </label>
              <select
                name="categoryId"
                id="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-shadow"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Kadaluwarsa & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Tanggal Kadaluwarsa*
              </label>
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              />
            </div>
            <div>
              <label
                htmlFor="supplier"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Supplier (Opsional)
              </label>
              <input
                type="text"
                name="supplier"
                id="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Deskripsi (Opsional)
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
            ></textarea>
          </div>

          {/* Upload Gambar */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Gambar Produk
            </label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview ? (
                <div className="relative group">
                  <Image
                    src={imagePreview}
                    alt="Preview Produk"
                    width={80}
                    height={80}
                    className="rounded-md object-cover border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Hapus Gambar"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center border-2 border-dashed border-slate-300">
                  <ImageOff size={32} className="text-slate-400" />
                </div>
              )}
              <label
                htmlFor="image-upload-input"
                className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center gap-2"
              >
                <UploadCloud size={16} />
                <span>
                  {imageFile || currentImageUrl
                    ? "Ganti Gambar"
                    : "Unggah Gambar"}
                </span>
              </label>
              <input
                id="image-upload-input"
                name="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="sr-only"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Max. 2MB (JPG, PNG, WEBP)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : product ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Produk"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
