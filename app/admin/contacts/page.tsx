"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminRoute } from "@/components/AdminRoute";

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
        setLoading(true);
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
        <AdminRoute>
            <div className="min-h-screen bg-gray-50 sm:px-4 lg:px-8 py-8 flex flex-col items-center">

            {/* Back Button */}
            <div className="w-full max-w-9xl mb-4 flex justify-start">
                <Button
                    onClick={() => router.back()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full shadow-sm cursor-pointer"
                >
                    ← Back to Dashboard
                </Button>
            </div>

            {/* Banner / Page Header */}
            <div className="w-full max-w-9xl bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200/50 p-6 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-0">
                            Contact Submissions
                        </h1>
                        <p className="text-sm sm:text-lg text-slate-600">
                            Manage all contact submissions
                        </p>
                    </div>
                    <Button
                        onClick={getContacts}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2 rounded-full shadow-lg cursor-pointer"
                    >
                        ⟳ Refresh
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full max-w-9xl bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-700 min-w-[700px]">
                        <thead className="bg-green-900 text-white text-left">
                            <tr>
                                <th className="px-4 py-3">NAME</th>
                                <th className="px-4 py-3">EMAIL</th>
                                <th className="px-4 py-3">PHONE</th>
                                <th className="px-4 py-3">MESSAGE</th>
                                <th className="px-4 py-3">DATE</th>
                                <th className="px-4 py-3 text-center">ACTION</th>
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
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 border-b transition cursor-pointer`}
                                    >
                                        <td className="px-4 py-3 font-semibold">{contact.name}</td>
                                        <td className="px-4 py-3">{contact.email}</td>
                                        <td className="px-4 py-3">{contact.phone}</td>
                                        <td className="px-4 py-3 max-w-[250px] truncate" title={contact.message}>
                                            {contact.message.length > 70 ? contact.message.slice(0, 70) + "..." : contact.message}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(contact.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() => setSelectedContact(contact)}
                                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-sm cursor-pointer text-sm"
                                                >
                                                    <Eye size={16} /> View
                                                </button>
                                                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-sm cursor-pointer text-sm">
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
            {
                selectedContact && (
                    <div className="fixed inset-0 backdrop-brightness-30 bg-opacity-40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md p-5 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-4">
                                Contact Details
                            </h2>

                            <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                                <p><span className="font-semibold">Name:</span> {selectedContact.name}</p>
                                <p><span className="font-semibold">Email:</span> {selectedContact.email}</p>
                                <p><span className="font-semibold">Phone:</span> {selectedContact.phone}</p>
                                <p><span className="font-semibold">Date:</span> {new Date(selectedContact.created_at).toLocaleString()}</p>
                                <div className="pt-2">
                                    <p className="font-semibold">Message:</p>
                                    <p className="bg-gray-100 p-3 rounded-lg mt-1 break-words">{selectedContact.message}</p>
                                </div>
                            </div>

                            <div className="mt-6 text-right">
                                <Button
                                    onClick={() => setSelectedContact(null)}
                                    className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg shadow cursor-pointer"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
        </AdminRoute>
    );
}
