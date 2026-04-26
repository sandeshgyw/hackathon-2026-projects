import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, ChevronRight, Filter } from "lucide-react"

export function Appointments() {
  const appointments = [
    {
      doctor: "Dr. Sarah Jenkins",
      specialty: "Cardiologist",
      date: "Oct 27, 2026",
      time: "10:30 AM",
      type: "In-Person",
      status: "Confirmed",
      location: "Central Medical Plaza, Room 402"
    },
    {
      doctor: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "Nov 02, 2026",
      time: "02:15 PM",
      type: "Video Call",
      status: "Pending",
      location: "Online Consultation"
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Appointments</h1>
          <p className="text-muted-foreground">Manage and track your upcoming healthcare visits.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
            Schedule New
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {appointments.map((appt, i) => (
          <Card key={i} className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-64 bg-slate-50 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">{appt.date.split(' ')[0]}</span>
                    <span className="text-xl font-bold text-slate-900 leading-none">{appt.date.split(' ')[1].replace(',', '')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Clock className="h-4 w-4 text-slate-400" /> {appt.time}
                  </div>
                </div>
                
                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {appt.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {appt.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{appt.doctor}</h3>
                    <p className="text-emerald-600 font-medium text-sm">{appt.specialty}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" /> {appt.location}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 shrink-0">
                    <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
                      Reschedule
                    </Button>
                    <Button variant="outline" className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200">
                      Cancel
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-xl text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
import { useAuth } from "@/hooks/useAuth";
import { useGetAppointmentsQuery } from "@/apis/appointmentsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Video, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function PatientAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.patient?.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (appointmentId: string) => {
    const url = `${window.location.origin}/patient/consultation/${appointmentId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(appointmentId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const { data: appointments, isLoading } = useGetAppointmentsQuery(
    { patientId },
    { skip: !patientId }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 bg-yellow-50">{status}</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">{status}</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">{status}</Badge>;
      case "RESCHEDULED":
        return <Badge variant="outline" className="text-blue-600 bg-blue-50">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Appointments</h2>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!appointments || appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt: any) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">
                    {apt.doctor?.user?.fullName || "Doctor"}
                    <div className="text-xs text-muted-foreground">{apt.doctor?.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium">
                          {format(new Date(apt.startTime), "PPp")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pl-5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">to</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(apt.endTime), "p")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.reason || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="text-right">
                    {apt.status === "CONFIRMED" && apt.callSession?.id && (
                      <div className="flex flex-col items-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200 gap-1.5"
                          onClick={() => navigate(`/patient/consultation/${apt.id}`)}
                        >
                          <Video className="w-4 h-4" />
                          Join Video Call
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                          onClick={() => copyLink(apt.id)}
                        >
                          {copiedId === apt.id ? (
                            <><Check className="w-3 h-3 text-green-600" /> Copied!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy link</>
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
