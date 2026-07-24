"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '@prescriply/ui';
import { FileText, Plus, Check, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Template {
  id: string;
  name: string;
  is_default: boolean;
  content: any;
}

export default function TemplatesPage() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('prescription_templates')
        .select('*')
        .eq('doctor_id', user.id);

      if (data) setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('prescription_templates')
        .insert({
          doctor_id: user.id,
          name: newTemplateName,
          is_default: templates.length === 0,
          sections: ['demographics', 'chief_complaints', 'medicines', 'advice'],
          content: {
            medicines: [
              { name: 'Tab. Paracetamol 500mg', dosage: '1+0+1', duration: '5 days', note: 'After meals' }
            ],
            advice: 'Drink plenty of water. Rest.'
          }
        })
        .select()
        .single();

      if (error) throw error;
      setTemplates([...templates, data]);
      setNewTemplateName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unset all defaults
      await supabase
        .from('prescription_templates')
        .update({ is_default: false })
        .eq('doctor_id', user.id);

      // Set this default
      await supabase
        .from('prescription_templates')
        .update({ is_default: true })
        .eq('id', id);

      setTemplates(templates.map(t => ({
        ...t,
        is_default: t.id === id
      })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Prescription Templates</h1>
        <p className="text-gray-500 text-sm">Save preferred medicament arrays and sections to speed up clinical workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Template Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Create Template</CardTitle>
            <CardDescription>Setup an outline layout.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateTemplate}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Template Name</label>
                <Input
                  required
                  placeholder="e.g. Standard Fever Template"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Create Template
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Templates List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">My Templates</CardTitle>
            <CardDescription>Default templates automatically pre-fill new prescriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading layouts...</p>
            ) : templates.length > 0 ? (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border border-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center space-x-1.5">
                          <span>{template.name}</span>
                          {template.is_default && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                              ACTIVE DEFAULT
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {template.content?.medicines?.length || 0} drugs preset
                        </p>
                      </div>
                    </div>

                    {!template.is_default ? (
                      <Button
                        variant="outline"
                        onClick={() => handleSetDefault(template.id)}
                        className="h-8 text-xs flex items-center space-x-1"
                      >
                        <Star className="h-3 w-3" />
                        <span>Set Default</span>
                      </Button>
                    ) : (
                      <div className="text-green-600 flex items-center space-x-1 text-xs font-semibold">
                        <Check className="h-4 w-4" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                No custom templates created yet. Set up one above!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
