"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { Eye } from "lucide-react";

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: string;
}

export default function ContactAdminPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const getContacts = async () => {
        try {
            const res = await api.get("/contact");
            setContacts(res.data.contacts || []);
        } catch (err) {
            console.error("Error fetching contacts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getContacts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-10 flex flex-col items-center">
            {/* Top Controls */}
            <div className="w-[90%] max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-6">
                <button
                    onClick={() => router.push("/admin")}
                    className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm transition text-sm sm:text-base"
                >
                    ← Back to Dashboard
                </button>

                <button
                    onClick={getContacts}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-medium px-5 py-2 rounded-lg shadow-md transition-all text-sm sm:text-base"
                >
                    <span>⟳</span> Refresh
                </button>
            </div>

            {/* Table */}
            <div className="w-[90%] max-w-7xl bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-gray-700 min-w-[700px]">
                        <thead className="bg-green-900 text-white text-left">
                            <tr>
                                <th className="px-3 sm:px-6 py-3">NAME</th>
                                <th className="px-3 sm:px-6 py-3">EMAIL</th>
                                <th className="px-3 sm:px-6 py-3">PHONE</th>
                                <th className="px-3 sm:px-6 py-3">MESSAGE</th>
                                <th className="px-3 sm:px-6 py-3">DATE</th>
                                <th className="px-3 sm:px-6 py-3 text-center">ACTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-500">
                                        Loading contacts...
                                    </td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-500">
                                        No contact submissions found.
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((contact, index) => (
                                    <tr
                                        key={contact.id}
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            } hover:bg-gray-100 border-b transition`}
                                    >
                                        <td className="px-3 sm:px-6 py-3 font-semibold whitespace-nowrap">
                                            {contact.name}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                                            {contact.email}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                                            {contact.phone}
                                        </td>
                                        <td
                                            className="px-3 sm:px-6 py-3 max-w-[200px] sm:max-w-sm truncate"
                                            title={contact.message}
                                        >
                                            {contact.message.length > 70
                                                ? contact.message.slice(0, 70) + "..."
                                                : contact.message}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                                            {new Date(contact.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 text-center">
                                            <div className="flex justify-center flex-wrap gap-2">
                                                <button
                                                    onClick={() => setSelectedContact(contact)}
                                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-sm text-xs sm:text-sm"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-sm text-xs sm:text-sm">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedContact && (
                <div className="fixed inset-0 backdrop-brightness-30 bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md p-5 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-4">
                            Contact Details
                        </h2>

                        <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                            <p>
                                <span className="font-semibold">Name:</span>{" "}
                                {selectedContact.name}
                            </p>
                            <p>
                                <span className="font-semibold">Email:</span>{" "}
                                {selectedContact.email}
                            </p>
                            <p>
                                <span className="font-semibold">Phone:</span>{" "}
                                {selectedContact.phone}
                            </p>
                            <p>
                                <span className="font-semibold">Date:</span>{" "}
                                {new Date(selectedContact.created_at).toLocaleString()}
                            </p>
                            <div className="pt-2">
                                <p className="font-semibold">Message:</p>
                                <p className="bg-gray-100 p-3 rounded-lg mt-1 break-words">
                                    {selectedContact.message}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg shadow text-sm sm:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
