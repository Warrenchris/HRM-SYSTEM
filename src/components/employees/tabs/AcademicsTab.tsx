import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, X, Upload } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmployeeFormData } from "../EmployeeFormTabs";

interface AcademicsTabProps {
  form: UseFormReturn<EmployeeFormData>;
}

export function AcademicsTab({ form }: AcademicsTabProps) {
  const [newAchievement, setNewAchievement] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    resume: null,
    offerLetter: null,
    joiningLetter: null,
    contract: null,
    idProof: null,
  });

  const achievements = form.watch("achievements") || [];
  const coursesTaken = form.watch("coursesTaken") || [];

  const addAchievement = () => {
    if (newAchievement.trim()) {
      const currentAchievements = form.getValues("achievements") || [];
      form.setValue("achievements", [...currentAchievements, newAchievement.trim()]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    const currentAchievements = form.getValues("achievements") || [];
    const updatedAchievements = currentAchievements.filter((_, i) => i !== index);
    form.setValue("achievements", updatedAchievements);
  };

  const addCourse = () => {
    if (newCourse.trim()) {
      const currentCourses = form.getValues("coursesTaken") || [];
      form.setValue("coursesTaken", [...currentCourses, newCourse.trim()]);
      setNewCourse("");
    }
  };

  const removeCourse = (index: number) => {
    const currentCourses = form.getValues("coursesTaken") || [];
    const updatedCourses = currentCourses.filter((_, i) => i !== index);
    form.setValue("coursesTaken", updatedCourses);
  };

  const handleDocumentUpload = (documentType: string, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const documentTypes = [
    { key: "resume", label: "Resume/CV" },
    { key: "offerLetter", label: "Offer Letter" },
    { key: "joiningLetter", label: "Joining Letter" },
    { key: "contract", label: "Contract/Agreement" },
    { key: "idProof", label: "ID Proof" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Academics & Documents</h3>
      
      {/* Achievements */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Achievements</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Add an achievement..."
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
            className="flex-1"
          />
          <Button type="button" onClick={addAchievement} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {achievement}
              <button 
                type="button"
                onClick={() => removeAchievement(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Courses Taken */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Courses Taken</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Add a course..."
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCourse())}
            className="flex-1"
          />
          <Button type="button" onClick={addCourse} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {coursesTaken.map((course, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {course}
              <button 
                type="button"
                onClick={() => removeCourse(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Other Academic Information */}
      <FormField
        control={form.control}
        name="otherAcademics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Academic Information</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional academic qualifications, certifications, or relevant information..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Documents Upload */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Documents to Upload</h4>
        <div className="grid grid-cols-1 gap-4">
          {documentTypes.map((docType) => (
            <div key={docType.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium">{docType.label}</label>
                {documents[docType.key] && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {documents[docType.key]?.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(docType.key, e.target.files?.[0] || null)}
                  className="hidden"
                  id={`doc-${docType.key}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`doc-${docType.key}`)?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {documents[docType.key] ? "Replace" : "Upload"}
                </Button>
                {documents[docType.key] && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDocumentUpload(docType.key, null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button type="button" variant="outline" className="w-full">
            Save Documentation
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
          </p>
        </div>
      </div>
    </div>
  );
}
