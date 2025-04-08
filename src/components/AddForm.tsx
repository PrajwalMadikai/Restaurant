import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadRestaurant } from '../../api calls/api_services';
import Footer from './Footer';

export default function AddForm() {
    const [name, setName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [contact, setContact] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Restaurant name is required", { position: 'top-right', duration: 2000 });
            return;
        }
        if (!location.trim()) {
            toast.error("Location is required", { position: 'top-right', duration: 2000 });
            return;
        }
        if (!contact.trim()) {
            toast.error("Contact number is required", { position: 'top-right', duration: 2000 });
            return;
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(contact)) {
            toast.error("Contact number must be 10 digits", { position: 'top-right', duration: 2000 });
            return;
        }
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast.error("Please select an image file", { position: 'top-right', duration: 2000 });
            return;
        }
        const validImageTypes = ['image/jpeg', 'image/png'];
        if (!validImageTypes.includes(file.type)) {
            toast.error("Only JPG or PNG images are allowed", { position: 'top-right', duration: 2000 });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must not exceed 5MB", { position: 'top-right', duration: 2000 });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('location', location);
        formData.append('contact', contact);
        formData.append('image', file);

        try {
            const response = await uploadRestaurant(formData);
            if (response.status === 201) {
                toast.success("Restaurant added successfully!", { position: 'top-right', duration: 2000 });

                setName('');
                setLocation('');
                setContact('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setImagePreview(null);
            } else {
                toast.error(response?.data?.message || "Failed to add restaurant", { position: 'top-right', duration: 2000 });
            }
        } catch (error) {
            console.error("Error adding restaurant:", error);
            toast.error("An unexpected error occurred", { position: 'top-right', duration: 2000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                    Add New Restaurant
                </h1>

                <form className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">
                            Restaurant Image
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-64 border-2 border-dashed border-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-50 transition-colors"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            setImagePreview(event.target?.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-12 w-12 mx-auto mb-2 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <p>Click to Upload Restaurant Image</p>
                                    <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label
                                htmlFor="restaurantName"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Restaurant Name
                            </label>
                            <input
                                type="text"
                                id="restaurantName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter restaurant name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="location"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter restaurant address"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="phone"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="w-full bg-black text-white py-3 rounded-md hover:bg-green-600 transition duration-300 font-semibold"
                        >
                            {loading ? "Adding..." : "Add Restaurant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <Footer/>
        </>
    );
}