import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ChartDataset, ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { EmployeeService }    from '../../core/services/employee.service';
import { AffectationService } from '../../core/services/affectation.service';
import { ProjetService }      from '../../core/services/projet.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  unassignedCount = 0;
  loading = true;
  error = '';

  Nbmember: number = 0;
  Nbevent: number = 0;

  // line
  chartData: ChartDataset[] = [
    {
      label: 'Projets (Affectations) per Employee',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }
  ];
  chartLabels: string[] = [];
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  chartOptionsNoScales: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    }
  };

  chartOptionsStacked: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  };

  chartOptionsHorizontalBar: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  };

  chartOptionsGauge: ChartOptions<'doughnut'> = {
    responsive: true,
    rotation: -90,
    circumference: 180,
    plugins: { legend: { display: true, position: 'top' } }
  };

  // Stacked BAR (Projects per month and status)
  chartDataMonth: ChartDataset<'bar'>[] = [];
  chartLabelsMonth: string[] = [];

  // HORIZONTAL BAR (Workload)
  chartDataWorkload: ChartDataset<'bar'>[] = [];
  chartLabelsWorkload: string[] = [];

  // GAUGE (Assignment Ratio)
  chartDataGauge: ChartDataset<'doughnut'>[] = [];
  chartLabelsGauge: string[] = ['Assignés', 'Sur le banc (Non assignés)'];

  // PIE (Employés par Catégorie)
  chartLabelsPie: string[] = [];
  chartDataPie: ChartDataset<'pie'>[] = [];

  // DOUGHNUT (Project Status)
  chartLabelDonught: string[] = [];
  chartDataDonught: ChartDataset<'doughnut'>[] = [];

  // TIMELINE SCATTER (Projects chronologically)
  chartDataTimeline: ChartDataset<'scatter'>[] = [];
  chartLabelsTimeline: string[] = [];
  chartOptionsTimeline: ChartOptions<any> = {};

  constructor(
    private dashboardService:   DashboardService,
    private employeeService:    EmployeeService,
    private affectationService: AffectationService,
    private projetService:      ProjetService,
    private router:             Router,
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    // Let's hold affectations data to calculate unassigned count later if needed
    let affectationsData: any[] = [];
    let employeesData: any[] = [];

    // Subscription 1: Affectations
    this.affectationService.getAll().pipe(catchError(() => of([]))).subscribe((resP) => {
      affectationsData = resP;
      this.calculateUnassigned(employeesData, affectationsData);
    });

    // Subscription 2: Employees
    this.employeeService.getAll().pipe(catchError(() => of([]))).subscribe((resE) => {
      employeesData = resE;
      this.calculateUnassigned(employeesData, affectationsData);
    });

    // Subscription 3: Projects by Month (Stacked Bar)
    this.projetService.getAll().pipe(catchError(() => of([]))).subscribe((projets) => {
      const enAttente = new Array(12).fill(0);
      const enCours   = new Array(12).fill(0);
      const termines  = new Array(12).fill(0);
      const monthNames = ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      projets.forEach((p: any) => {
        if (p.dateDebut) {
          const date = new Date(p.dateDebut);
          const m = date.getMonth();
          if (p.statut === 'EN_ATTENTE') enAttente[m]++;
          else if (p.statut === 'EN_COURS') enCours[m]++;
          else if (p.statut === 'TERMINE') termines[m]++;
          else enAttente[m]++; // default fallback
        }
      });
      
      this.chartLabelsMonth = monthNames;
      this.chartDataMonth = [
        { label: 'Terminé', data: termines, backgroundColor: '#87bba2', borderWidth: 0, stack: 'Stack 0' },
        { label: 'En Cours', data: enCours, backgroundColor: '#70c1b3', borderWidth: 0, stack: 'Stack 0' },
        { label: 'En Attente', data: enAttente, backgroundColor: '#fef3c7', borderWidth: 0, stack: 'Stack 0' }
      ];

      // Build Timeline Chart (Scatter)
      const validProjets = projets.filter((p: any) => p.dateDebut && p.dateFin);
      const colors = ['#70c1b3', '#87bba2', '#3b6064', '#c9dcd8', '#f59e0b', '#ef4444', '#a3bfb8'];
      
      this.chartLabelsTimeline = validProjets.map((p: any) => p.nom);
      this.chartDataTimeline = validProjets.map((p: any, i: number) => {
        const start = new Date(p.dateDebut).getTime();
        let end = new Date(p.dateFin).getTime();

        if (end <= start) {
          end = start + 86400000; // push 1 day for visibility
        }

        return {
          label: p.nom,
          data: [
            { x: start, y: i },
            { x: end,   y: i }
          ],
          backgroundColor: colors[i % colors.length],
          borderColor: colors[i % colors.length],
          borderWidth: 2,
          showLine: true,
          pointRadius: 6,
          tension: 0
        };
      });

      // Calculate dynamic minimum start date based on oldest project
      let minTime = new Date().getTime();
      if (validProjets.length > 0) {
        const oldestUnix = Math.min(...validProjets.map((p: any) => new Date(p.dateDebut).getTime()));
        const oldestDate = new Date(oldestUnix);
        oldestDate.setMonth(oldestDate.getMonth() - 1); // 1 month of padding before first project
        minTime = oldestDate.getTime();
      }

      this.chartOptionsTimeline = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { left: 20 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const proj = validProjets[ctx.datasetIndex];
                if (!proj) return '';
                const dateObj = new Date(ctx.parsed.x);
                const date = dateObj.toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });
                const isStart = ctx.dataIndex === 0;
                return `${proj.nom} — ${isStart ? 'Début' : 'Fin'}: ${date}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: { month: 'MMM yy' }
            },
            min: minTime,
            grid: { color: '#eef2f1' },
            ticks: { color: '#87bba2', font: { size: 11 } }
          },
          y: {
            type: 'linear',
            ticks: {
              color: '#87bba2',
              font: { size: 11 },
              stepSize: 1,
              callback: (val: any) => {
                const name = validProjets[val as number]?.nom ?? '';
                return name.length > 18 ? name.substring(0, 16) + '…' : name;
              }
            },
            grid: { color: '#eef2f1' }
          }
        }
      };

    });

    // Subscription 4: Main Stats Dashboard
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.Nbevent = stats.totalProjets;
        
        // Use backend unassigned count if provided, otherwise the calculation logic will handle it
        if (stats.unassignedEmployees != null) {
          this.unassignedCount = stats.unassignedEmployees;
        }

        // populate Pie chart -> categories
        const categories = this.categoryEntries;
        this.chartLabelsPie = categories.map(c => c.name);
        this.chartDataPie = [
          {
            label: 'Employés',
            data: categories.map(c => c.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.4)',
              'rgba(54, 162, 235, 0.4)',
              'rgba(255, 206, 86, 0.4)',
              'rgba(75, 192, 192, 0.4)',
              'rgba(153, 102, 255, 0.4)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }
        ];

        // populate Doughnut chart -> Project status
        this.chartLabelDonught = ['En Attente', 'En Cours', 'Terminé'];
        this.chartDataDonught = [
          {
            data: [stats.projetsEnAttente || 0, stats.projetsEnCours || 0, stats.projetsTermines || 0],
            backgroundColor: ['#fef3c7', '#d1fae5', '#f1f5f9'],
            hoverBackgroundColor: ['#fde68a', '#a7f3d0', '#e2e8f0'],
            borderWidth: 1
          }
        ];
        
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });
  }

  // Fallback calculation helper that runs after both endpoints respond
  calculateUnassigned(employees: any[], affectations: any[]): void {
    if (employees.length > 0) {
      this.Nbmember = employees.length;

      // Populate Workload Bar (Horizontal)
      const affectationCounts = employees.map(e => {
        return {
          name: e.nom + ' ' + e.prenom,
          count: affectations.filter(a => a.employee?.id === e.id).length
        };
      }).sort((a,b) => b.count - a.count).slice(0, 5); // top 5

      this.chartLabelsWorkload = affectationCounts.map(e => e.name);
      this.chartDataWorkload = [{
        label: 'Projets assignés',
        data: affectationCounts.map(e => e.count),
        backgroundColor: '#70c1b3',
        borderRadius: 4
      }];

      const assignedIds = new Set<number>(
        affectations.map((a: any) => a.employee?.id).filter((id: any) => id != null)
      );
      this.unassignedCount = employees.filter((e: any) => !assignedIds.has(e.id)).length;
      
      const maxCount = employees.length;
      const assignedCount = maxCount - this.unassignedCount;
      
      // Populate Gauge
      this.chartDataGauge = [{
        data: [assignedCount, this.unassignedCount],
        backgroundColor: ['rgba(112, 193, 179, 1)', 'rgba(238, 242, 241, 1)'],
        borderWidth: 0,
        hoverBackgroundColor: ['rgba(112, 193, 179, 1)', 'rgba(238, 242, 241, 1)'],
      }];
    }
  }

  goToUnassigned(): void {
    this.router.navigate(['/admin/employees'], { queryParams: { unassigned: 'true' } });
  }

  get categoryEntries(): { name: string; count: number }[] {
    if (!this.stats?.employeesPerCategory) return [];
    const data = this.stats.employeesPerCategory;
    if (Array.isArray(data)) {
      return (data as any[]).map(item => {
        const name: string =
          item.categorie?.nom
          ?? item.categorieNom
          ?? item.nom
          ?? (typeof item.categorie === 'string' ? item.categorie : null)
          ?? '—';
        const count: number = item.count ?? item.total ?? item.nb ?? 0;
        return { name, count };
      });
    }
    return Object.entries(data as { [key: string]: number }).map(([name, count]) => ({ name, count }));
  }

  get projetsEndingSoon(): any[] {
    return this.stats?.projetsEndingSoon ?? [];
  }

  countdownClass(jours: number | undefined): string {
    if (jours == null) return '';
    if (jours <= 7)  return 'countdown-urgent';
    if (jours <= 30) return 'countdown-warning';
    return 'countdown-ok';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = { EN_ATTENTE: 'En attente', EN_COURS: 'En cours', TERMINE: 'Terminé' };
    return map[statut] ?? statut;
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = { EN_ATTENTE: 'chip-attente', EN_COURS: 'chip-cours', TERMINE: 'chip-termine' };
    return map[statut] ?? '';
  }
}
