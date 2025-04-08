import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteRestaurant, fetchAll, updateRestaurant } from '../../api calls/api_services';

export interface RestaurentType {
    id: string;
    name: string;
    image: string;
    location: string;
    contact: string;
}

export default function Home() {
    const [restaurant, setRestaurant] = useState<RestaurentType[]>([]);
    const [editingRestaurant, setEditingRestaurant] = useState<RestaurentType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            const response = await fetchAll();
            setRestaurant(response.data.data);
        };
        fetchRestaurant();
    }, []);

    const handleEditClick = (restaurant: RestaurentType) => {
        setEditingRestaurant(restaurant);
        setIsModalOpen(true);
        setPreviewImage(restaurant.image);
    };

    const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingRestaurant) return;

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const location = formData.get("location") as string;
        const contact = formData.get("contact") as string;

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

        const updatedFormData = new FormData();
        updatedFormData.append('name', name);
        updatedFormData.append('location', location);
        updatedFormData.append('contact', contact);

        if (fileInputRef.current?.files?.[0]) {
            const file = fileInputRef.current.files[0];
            const validImageTypes = ['image/jpeg', 'image/png'];
            if (!validImageTypes.includes(file.type)) {
                toast.error("Only JPG or PNG images are allowed", { position: 'top-right', duration: 2000 });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must not exceed 5MB", { position: 'top-right', duration: 2000 });
                return;
            }
            updatedFormData.append('image', file);
        }

        try {
            const response = await updateRestaurant(editingRestaurant.id, updatedFormData);
            const updatedRestaurant = response.data.data;
            setRestaurant((prev) => prev.map((res) => (res.id === editingRestaurant.id ? updatedRestaurant : res)));
            setIsModalOpen(false);
            setPreviewImage(null);
            toast.success("Restaurant Edited!", { duration: 3000, position: 'top-right' });
        } catch (error) {
            console.error("Error updating restaurant:", error);
            toast.error("Failed to update restaurant", { duration: 3000, position: 'top-right' });
        }
    };

    const handleDeleteClick = async (resId: string) => {
        try {
            await deleteRestaurant(resId);
            setRestaurant((prev) => prev.filter((res) => res.id !== resId));
            toast.success("Restaurant deleted!", { duration: 3000, position: 'top-right' });
        } catch (error) {
            console.error("Error deleting restaurant:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
        {/* Black Header Section */}
        <div className="relative bg-cover bg-center h-96 flex items-center justify-center text-white" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?restaurants')" }}>
            <div className="absolute inset-0 bg-black opacity-90"></div>
            <div className="z-10 text-center px-4">
                <h1 className="text-5xl font-bold mb-4 tracking-tight">Discover Your Favorite Restaurants</h1>
                <p className="text-xl max-w-2xl mx-auto">Explore a wide range of dining options tailored just for you.</p>
                <div className="mt-8">
                    <button className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300 shadow-lg">Explore Now</button>
                </div>
            </div>
        </div>
    
        {/* Dark Blue Main Content Section */}
        <div className="bg-blue-900 text-white py-16 relative">
            <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?pattern')" }}></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-4xl font-bold tracking-tight">Featured Restaurants</h2>
                    <div className="hidden md:flex items-center space-x-3">
                        <div className="flex items-center bg-blue-800 rounded-full px-4 py-2">
                            <input type="text" placeholder="Search restaurants..." className="bg-transparent border-none focus:outline-none text-white placeholder-blue-300 w-64" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select className="bg-blue-800 border-none rounded-full px-4 py-2 focus:outline-none text-white">
                            <option>Sort by: Featured</option>
                            <option>Sort by: Name</option>
                            <option>Sort by: Location</option>
                        </select>
                    </div>
                </div>
    
                {/* Restaurant Grid with Enhanced Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {restaurant?.map((restaurant, index) => (
                        <div key={index} className="bg-white text-gray-800 rounded-xl overflow-hidden transform hover:scale-105 transition duration-300 shadow-xl hover:shadow-2xl">
                            <div className="relative">
                                <img src={restaurant.image} alt={restaurant.name} className="w-full h-64 object-cover" />
                                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    Premium
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-blue-800">{restaurant.name}</h3>
                                    <div className="flex items-center text-yellow-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <span className="ml-1 text-gray-700 font-medium">4.8</span>
                                    </div>
                                </div>
                                <div className="flex items-center mb-3 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p>{restaurant.location}</p>
                                </div>
                                <div className="flex items-center mb-6 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <p>{restaurant.contact}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex space-x-2">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-medium">Italian</span>
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-medium">$$</span>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => handleEditClick(restaurant)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 transition duration-300 font-medium">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteClick(restaurant.id)} className="bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition duration-300 font-medium">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
    
                {/* Pagination */}
                <div className="mt-12 flex justify-center">
                    <div className="flex space-x-2">
                        <button className="w-10 h-10 flex items-center justify-center bg-blue-800 text-white rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-white text-blue-800 font-bold rounded-md">1</button>
                        <button className="w-10 h-10 flex items-center justify-center bg-blue-800 text-white rounded-md">2</button>
                        <button className="w-10 h-10 flex items-center justify-center bg-blue-800 text-white rounded-md">3</button>
                        <button className="w-10 h-10 flex items-center justify-center bg-blue-800 text-white rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
        {/* Edit Modal */}
        {isModalOpen && editingRestaurant && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-900">Edit Restaurant</h1>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSaveChanges}>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2">Restaurant Image</label>
                            <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setPreviewImage(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>Click to Upload Restaurant Image</p>
                                        <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Restaurant Name</label>
                                <input type="text" id="name" name="name" defaultValue={editingRestaurant.name} placeholder="Enter restaurant name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="location" className="block text-gray-700 font-bold mb-2">Location</label>
                                <input type="text" id="location" name="location" defaultValue={editingRestaurant.location} placeholder="Enter restaurant address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="contact" className="block text-gray-700 font-bold mb-2">Contact Number</label>
                                <input type="tel" id="contact" name="contact" defaultValue={editingRestaurant.contact} placeholder="Enter phone number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            
                        </div>
                        <div className="mt-6 flex space-x-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 transition duration-300 font-semibold">Cancel</button>
                            <button type="submit" className="w-1/2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
    );
}