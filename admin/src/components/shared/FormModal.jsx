import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FormModal({ open, onClose, title, fields, values = {}, onChange, onSubmit, loading }) {
  const handleChange = (key, val) => onChange({ ...values, [key]: val });

  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}
    return val;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-4 mt-2">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs font-medium">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</Label>
              {f.type === 'select' ? (
                <Select value={values[f.key] || ''} onValueChange={v => handleChange(f.key, v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={`Select ${f.label}`} /></SelectTrigger>
                  <SelectContent>
                    {f.options.map(o => {
                      const val = typeof o === 'object' ? o.value : o;
                      const label = typeof o === 'object' ? o.label : o;
                      return <SelectItem key={val} value={val}>{label}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              ) : f.type === 'textarea' ? (
                <Textarea
                  value={values[f.key] || ''}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder || ''}
                  className="text-sm resize-none"
                  rows={3}
                />
              ) : f.type === 'file' ? (
                <div className="space-y-2">
                  {values[f.key] ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                        <img
                          src={typeof values[f.key] === 'string' ? values[f.key] : URL.createObjectURL(values[f.key])}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files[0] && handleChange(f.key, e.target.files[0])}
                          className="hidden"
                          id={`file-replace-${f.key}`}
                        />
                        <label
                          htmlFor={`file-replace-${f.key}`}
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer"
                        >
                          Replace Image
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleChange(f.key, '')}
                          className="text-xs h-8"
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => handleChange(f.key, e.target.files[0])}
                      className="text-sm h-9"
                    />
                  )}
                </div>
              ) : (
                <Input
                  type={f.type || 'text'}
                  value={f.type === 'date' ? formatDateForInput(values[f.key]) : (values[f.key] || '')}
                  onChange={e => {
                    const rawVal = e.target.value;
                    let val = rawVal;
                    if (f.type === 'number') {
                      val = rawVal === '' ? '' : Math.max(0, Number(rawVal));
                    }
                    handleChange(f.key, val);
                  }}
                  min={f.type === 'number' ? 0 : undefined}
                  placeholder={f.placeholder || ''}
                  required={f.required}
                  className="h-9 text-sm"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}