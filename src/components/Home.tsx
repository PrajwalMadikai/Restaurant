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
        <div className="min-h-screen bg-white">
            <div className="relative bg-cover bg-center h-96 flex items-center justify-center text-white" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?restaurants')" }}>
                <div className="absolute inset-0 bg-black opacity-80"></div>
                <div className="z-10 text-center">
                    <h1 className="text-5xl font-bold mb-4">Discover Your Favorite Restaurants</h1>
                    <p className="text-xl">Explore a wide range of dining options tailored just for you.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-start">Featured Restaurants</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {restaurant?.map((restaurant, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-green-600">{restaurant.name}</h3>
                                    <div className="space-x-2">
                                        <button onClick={() => handleEditClick(restaurant)} className="text-blue-500 hover:text-blue-700">Edit</button>
                                        <button onClick={() => handleDeleteClick(restaurant.id)} className="text-red-500 hover:text-red-700">Delete</button>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-1"><strong>Location:</strong> {restaurant.location}</p>
                                <p className="text-gray-700"><strong>Phone:</strong> {restaurant.contact}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && editingRestaurant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Edit Restaurant</h1>
                        <form onSubmit={handleSaveChanges}>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-bold mb-2">Restaurant Image</label>
                                <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-2 border-dashed border-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-50 transition-colors">
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    <input type="text" id="name" name="name" defaultValue={editingRestaurant.name} placeholder="Enter restaurant name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="location" className="block text-gray-700 font-bold mb-2">Location</label>
                                    <input type="text" id="location" name="location" defaultValue={editingRestaurant.location} placeholder="Enter restaurant address" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="contact" className="block text-gray-700 font-bold mb-2">Contact Number</label>
                                    <input type="tel" id="contact" name="contact" defaultValue={editingRestaurant.contact} placeholder="Enter phone number" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500" />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition duration-300 font-semibold">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}