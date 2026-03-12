"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Search, X, Upload, Bell, Package, Tag, ExternalLink, CheckCircle } from "lucide-react";

interface Product {
  id: number;
  name?: string;
  title?: string;
  img1: string;
  sellingPrice: number | null;
  price: number | null;
}

interface Category {
  id: number;
  name: string;
  image: string;
}

// ================= IMAGE URL HELPER (Same as ProductCard) =================
function buildImageUrl(img: string | null | undefined): string {
  if (!img) return "/placeholder.png";
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  
  // Already a full URL
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }
  
  // Has /uploads/products/ prefix
  if (img.startsWith("/uploads/products/")) {
    return API_URL + img;
  }
  
  // Has /uploads/categories/ prefix
  if (img.startsWith("/uploads/categories/")) {
    return API_URL + img;
  }
  
  // Just filename - assume it's a product image
  const base = `${API_URL}/uploads/products/`;
  return base + img;
}

export default function SendNotification() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [linkType, setLinkType] = useState<"none" | "product" | "category" | "external">("none");
  const [linkValue, setLinkValue] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  
  const [role, setRole] = useState<"USER" | "SELLER">("USER");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[] | Category[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | Category | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to get display name
  const getDisplayName = (item: Product | Category): string => {
    if ('title' in item && item.title) return item.title;
    if ('name' in item && item.name) return item.name;
    return 'Unnamed Item';
  };

  // Search products or categories
  useEffect(() => {
    if (!searchQuery || linkType === "none" || linkType === "external") {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        const endpoint = linkType === "product" 
          ? "/notifications/admin/search-products" 
          : "/notifications/admin/search-categories";
        
        const { data } = await api.get(endpoint, {
          params: { q: searchQuery },
        });
        
        console.log("Search results:", data);
        setSearchResults(data);
        setShowSearch(data.length > 0);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
        setShowSearch(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, linkType]);

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to server
  const uploadImage = async () => {
    if (!imageFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", imageFile);

      const { data } = await api.post("/notifications/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImage(data.url);
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Select product or category
  const handleSelectItem = (item: Product | Category) => {
    console.log("Selected item:", item);
    setSelectedItem(item);
    setLinkValue(String(item.id));
    setSearchQuery("");
    setShowSearch(false);
    
    // Auto-fill image if not already set
    if (!image && !imagePreview) {
      const itemImage = 'img1' in item ? item.img1 : item.image;
      if (itemImage) {
        setImage(itemImage);
      }
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItem(null);
    setLinkValue("");
    setSearchQuery("");
  };

  // Send notification
  const sendNotification = async () => {
    if (!title || !message) {
      alert("Title and message are required");
      return;
    }

    // Upload image first if file is selected but not uploaded
    if (imageFile && !image) {
      await uploadImage();
    }

    try {
      setLoading(true);

      const payload = {
        title,
        message,
        image: image || undefined,
        linkType,
        linkValue: linkType === "external" ? externalUrl : linkValue,
        role,
      };

      await api.post("/notifications/admin/send-rich", payload);

      alert(`Notification sent to all ${role}s successfully!`);

      // Reset form
      setTitle("");
      setMessage("");
      setImage("");
      setImageFile(null);
      setImagePreview("");
      setLinkType("none");
      setLinkValue("");
      setExternalUrl("");
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amazon-darkBlue text-white rounded-xl">
          <Bell size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-amazon-darkBlue tracking-tight">
            Push Notifications
          </h1>
          <p className="text-amazon-mutedText font-medium">
            Send promotional notifications to customers and sellers
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amazon-borderGray p-6 space-y-6">
        
        {/* TARGET AUDIENCE */}
        <div className="p-4 bg-amazon-lightGray rounded-lg border border-amazon-borderGray">
          <label className="block text-[11px] font-black uppercase tracking-widest mb-3 text-amazon-darkBlue">
            Target Audience
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="USER"
                checked={role === "USER"}
                onChange={(e) => setRole(e.target.value as "USER" | "SELLER")}
                className="w-5 h-5 accent-amazon-orange cursor-pointer"
              />
              <span className="font-bold text-amazon-text group-hover:text-amazon-orange transition-colors">
                👤 Customers
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="SELLER"
                checked={role === "SELLER"}
                onChange={(e) => setRole(e.target.value as "USER" | "SELLER")}
                className="w-5 h-5 accent-amazon-orange cursor-pointer"
              />
              <span className="font-bold text-amazon-text group-hover:text-amazon-orange transition-colors">
                🏪 Sellers
              </span>
            </label>
          </div>
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-amazon-darkBlue">
            Notification Title *
          </label>
          <input
            type="text"
            placeholder="e.g., 50% Off on All Shirts!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-2 border-amazon-borderGray rounded-lg p-3 focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 outline-none transition-all font-medium text-amazon-text"
            maxLength={50}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-amazon-mutedText">Keep it short and catchy</span>
            <span className="text-xs font-bold text-amazon-mutedText">{title.length}/50</span>
          </div>
        </div>

        {/* MESSAGE */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-amazon-darkBlue">
            Message Content *
          </label>
          <textarea
            placeholder="e.g., Limited time offer. Shop now and save big!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border-2 border-amazon-borderGray rounded-lg p-3 focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 outline-none transition-all font-medium text-amazon-text resize-none"
            rows={3}
            maxLength={150}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-amazon-mutedText">Clear and compelling message</span>
            <span className="text-xs font-bold text-amazon-mutedText">{message.length}/150</span>
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-amazon-darkBlue">
            Notification Image (Optional)
          </label>
          
          {!(imagePreview || image) ? (
            <div className="flex gap-3">
              <label className="flex-1 border-2 border-dashed border-amazon-borderGray rounded-lg p-8 cursor-pointer hover:border-amazon-orange hover:bg-amazon-lightGray transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-amazon-lightGray rounded-full group-hover:bg-white transition-colors">
                    <Upload className="w-8 h-8 text-amazon-mutedText group-hover:text-amazon-orange transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-amazon-text">
                      {imageFile ? imageFile.name : "Click to upload image"}
                    </p>
                    <p className="text-xs text-amazon-mutedText mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>
              </label>

              {imageFile && !image && (
                <button
                  onClick={uploadImage}
                  disabled={uploading}
                  className="px-8 py-4 bg-amazon-success text-white rounded-lg hover:bg-amazon-success/90 disabled:bg-amazon-mutedText disabled:cursor-not-allowed font-bold transition-all shadow-md hover:shadow-lg"
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
              )}
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={imagePreview || buildImageUrl(image)}
                alt="Preview"
                className="max-h-60 rounded-xl border-2 border-amazon-borderGray shadow-md"
              />
              <button
                onClick={() => {
                  setImage("");
                  setImageFile(null);
                  setImagePreview("");
                }}
                className="absolute -top-3 -right-3 bg-amazon-danger text-white rounded-full p-2 hover:bg-amazon-danger/90 shadow-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 bg-amazon-success text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle size={14} />
                Image Ready
              </div>
            </div>
          )}
        </div>

        {/* LINK TYPE */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest mb-3 text-amazon-darkBlue">
            Action on Click
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { value: "none", label: "No Action", icon: <X className="w-5 h-5" /> },
              { value: "product", label: "Open Product", icon: <Package className="w-5 h-5" /> },
              { value: "category", label: "Open Category", icon: <Tag className="w-5 h-5" /> },
              { value: "external", label: "External Link", icon: <ExternalLink className="w-5 h-5" /> },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setLinkType(option.value as any);
                  clearSelection();
                }}
                className={`p-4 rounded-lg border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                  linkType === option.value
                    ? "border-amazon-orange bg-amazon-orange/10 text-amazon-orange shadow-md"
                    : "border-amazon-borderGray text-amazon-text hover:border-amazon-orange/50 hover:bg-amazon-lightGray"
                }`}
              >
                {option.icon}
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT/CATEGORY SEARCH */}
        {(linkType === "product" || linkType === "category") && (
          <div className="relative">
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-amazon-darkBlue">
              Select {linkType === "product" ? "Product" : "Category"}
            </label>
            
            {selectedItem ? (
              <div className="border-2 border-amazon-success bg-amazon-success/5 rounded-lg p-4 flex items-center gap-4">
                <img
                  src={buildImageUrl('img1' in selectedItem ? selectedItem.img1 : selectedItem.image)}
                  alt={getDisplayName(selectedItem)}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-amazon-borderGray"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                  }}
                />
                <div className="flex-1">
                  <div className="font-bold text-amazon-text">{getDisplayName(selectedItem)}</div>
                  {'sellingPrice' in selectedItem && selectedItem.sellingPrice !== null && (
                    <div className="text-sm text-amazon-mutedText mt-1">
                      ₹{Number(selectedItem.sellingPrice).toLocaleString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={clearSelection}
                  className="p-2 bg-amazon-danger text-white rounded-lg hover:bg-amazon-danger/90 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-4 w-5 h-5 text-amazon-mutedText pointer-events-none" />
                  <input
                    type="text"
                    placeholder={`Search for ${linkType}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                    className="w-full border-2 border-amazon-borderGray rounded-lg pl-12 pr-4 py-3 focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 outline-none transition-all font-medium text-amazon-text"
                  />
                </div>

                {/* SEARCH DROPDOWN WITH IMAGE URL HANDLING */}
                {showSearch && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-amazon-borderGray rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                    {searchResults.map((item, index) => {
                      const isProduct = 'img1' in item;
                      const rawImageUrl = isProduct 
                        ? (item as Product).img1 
                        : (item as Category).image;
                      
                      // Build proper image URL
                      const imageUrl = buildImageUrl(rawImageUrl);
                      const displayName = getDisplayName(item);
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`w-full p-4 flex items-center gap-4 hover:bg-amazon-lightGray transition-colors text-left ${
                            index !== searchResults.length - 1 ? 'border-b border-amazon-borderGray' : ''
                          }`}
                        >
                          <div className="w-14 h-14 flex-shrink-0 bg-amazon-lightGray rounded-lg overflow-hidden border border-amazon-borderGray">
                            <img
                              src={imageUrl}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.png';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amazon-text truncate">
                              {displayName}
                            </div>
                            {isProduct && (item as Product).sellingPrice !== null && (
                              <div className="text-sm text-amazon-mutedText mt-1">
                                <span className="font-bold text-amazon-danger">
                                  ₹{Number((item as Product).sellingPrice).toLocaleString()}
                                </span>
                                {(item as Product).price !== null && 
                                 (item as Product).price !== (item as Product).sellingPrice && (
                                  <span className="ml-2 line-through text-amazon-mutedText">
                                    ₹{Number((item as Product).price).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* NO RESULTS */}
                {showSearch && searchResults.length === 0 && searchQuery && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-amazon-borderGray rounded-xl shadow-xl p-6 text-center">
                    <p className="text-amazon-mutedText font-medium">
                      No {linkType}s found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* EXTERNAL URL */}
        {linkType === "external" && (
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2 text-amazon-darkBlue">
              External URL
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-4 top-4 w-5 h-5 text-amazon-mutedText pointer-events-none" />
              <input
                type="url"
                placeholder="https://example.com/page"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full border-2 border-amazon-borderGray rounded-lg pl-12 pr-4 py-3 focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 outline-none transition-all font-medium text-amazon-text"
              />
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {(title || message || image) && (
          <div className="p-6 bg-gradient-to-br from-amazon-lightGray to-white rounded-xl border-2 border-amazon-borderGray">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-amazon-success rounded-full animate-pulse"></div>
              <p className="text-[11px] font-black uppercase tracking-widest text-amazon-darkBlue">
                Live Preview
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 border border-amazon-borderGray max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-amazon-orange" />
                <span className="text-xs font-bold text-amazon-mutedText">ShopyBucks</span>
              </div>
              <div className="font-bold text-amazon-darkBlue mb-2 text-lg">
                {title || "Your Title Here"}
              </div>
              <div className="text-sm text-amazon-text mb-3 leading-relaxed">
                {message || "Your message will appear here"}
              </div>
              {(image || imagePreview) && (
                <img
                  src={imagePreview || buildImageUrl(image)}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-amazon-borderGray"
                />
              )}
            </div>
          </div>
        )}

        {/* SEND BUTTON */}
        <button
          onClick={sendNotification}
          disabled={loading || !title || !message}
          className="w-full bg-amazon-orange hover:bg-amazon-orangeHover disabled:bg-amazon-mutedText disabled:cursor-not-allowed text-white px-8 py-5 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending Notifications...
            </>
          ) : (
            <>
              <Bell className="w-6 h-6" />
              Send to All {role === "USER" ? "Customers" : "Sellers"}
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-amazon-mutedText">
            📊 This will send push notifications to all active {role.toLowerCase()}s in the database
          </p>
        </div>
      </div>
    </div>
  );
}