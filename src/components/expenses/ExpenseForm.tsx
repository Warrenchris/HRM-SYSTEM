import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useExpenseCategoriesQuery, useSubmitExpenseMutation } from "@/hooks/queries/useExpenseQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

// Form validation schema
const expenseFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expenseDate: z.date({ required_error: "Expense date is required" }),
  merchant: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export function ExpenseForm() {
  const { employee, loading: employeeLoading } = useCurrentEmployee();
  const { data: categories = [], isLoading: categoriesLoading } = useExpenseCategoriesQuery();
  const submitExpenseMutation = useSubmitExpenseMutation();
  const [receipts, setReceipts] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      merchant: "",
      description: "",
    },
  });

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReceipts(prev => [...prev, ...files]);
  };

  const removeReceipt = (index: number) => {
    setReceipts(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!employee?.id) {
      toast({
        title: "Error",
        description: "Employee information not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitExpenseMutation.mutateAsync({
        category_id: data.categoryId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        expense_date: format(data.expenseDate, 'yyyy-MM-dd'),
        merchant: data.merchant || undefined,
        employee_id: employee.id,
        receipt_urls: [], // TODO: Handle file uploads
      });

      form.reset();
      setReceipts([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (categoriesLoading || employeeLoading || !employee) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading form...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
        <CardDescription>
          Fill out the form below to submit your expense claim
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of expense" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          KES
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="text-right pl-12"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={categories.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder={categories.length === 0 ? "No active categories found" : "Select category"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expense Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Merchant/Vendor (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Starbucks, Amazon, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the business purpose of this expense..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Receipts (Optional)</FormLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload receipt images or PDFs
                    </p>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleReceiptUpload}
                        />
                        Choose Files
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
              
              {receipts.length > 0 && (
                <div className="space-y-2">
                  <FormLabel>Uploaded Receipts</FormLabel>
                  <div className="space-y-2">
                    {receipts.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReceipt(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  form.reset();
                  setReceipts([]);
                }}
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={submitExpenseMutation.isPending}
              >
                {submitExpenseMutation.isPending ? "Submitting..." : "Submit for Approval"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}