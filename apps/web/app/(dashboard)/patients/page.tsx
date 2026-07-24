"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@prescriply/ui';
import { Search, UserPlus, Phone, Mail, Calendar, Hash } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  reg_no?: string;
  date_of_birth?: string;
  blood_group?: string;
  created_at: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients || []);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.reg_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Patient Registry</h1>
          <p className="text-gray-500 text-sm">Review patient details, visit histories, and secure encrypted contact information.</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search by name, contact, or Reg No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-sm text-gray-500">Decrypting patient information secure tunnels...</p>
          ) : filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Patient Name</th>
                    <th className="py-4 px-6">Reg No / ID</th>
                    <th className="py-4 px-6">Contact info</th>
                    <th className="py-4 px-6">DOB / Age</th>
                    <th className="py-4 px-6">Blood Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-950">{patient.name}</td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {patient.reg_no || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        {patient.phone && (
                          <div className="flex items-center text-xs text-gray-600 space-x-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center text-xs text-gray-400 space-x-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {patient.date_of_birth ? (
                          <span>
                            {new Date(patient.date_of_birth).toLocaleDateString()}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 font-semibold rounded-full">
                          {patient.blood_group || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-gray-500">
              No patients registered. Author a prescription to securely register a patient.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
