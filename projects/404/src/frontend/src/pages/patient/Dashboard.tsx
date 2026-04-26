import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Good Morning, John</h2>
          <p className="text-muted-foreground">Your health summary is looking great.</p>
        </div>
        <Button className="shrink-0 bg-primary/90 shadow-md">Book Appointment</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Next Appointment</CardTitle>
            <CardDescription className="text-primary font-medium">Tomorrow, 10:30 AM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">Dr. Sarah Jenkins</div>
            <p className="text-sm text-muted-foreground mb-4">Cardiology Department</p>
            <Button size="sm" variant="outline" className="w-full">Reschedule</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Test Results</CardTitle>
            <CardDescription>Complete Blood Count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Normal</span>
              <span className="text-xs text-muted-foreground">Oct 12, 2026</span>
            </div>
            <Button size="sm" variant="link" className="px-0">View Full Report &rarr;</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="flex justify-between items-center text-sm border-b pb-2">
               <span className="font-medium">Lisinopril 10mg</span>
               <span className="text-muted-foreground">1 daily</span>
             </div>
             <div className="flex justify-between items-center text-sm pb-2">
               <span className="font-medium">Atorvastatin 20mg</span>
               <span className="text-muted-foreground">1 at night</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
