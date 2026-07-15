import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Brain, Zap, Users, BarChart3, ArrowRight, Heart, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hospitalHero from '@/assets/hospital-hero.jpg';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Triage',
    description: 'Multi-agent system automatically classifies patient severity with explainable reasoning.'
  },
  {
    icon: Shield,
    title: 'Risk Prediction',
    description: 'Real-time deterioration forecasting to prevent critical situations.'
  },
  {
    icon: Zap,
    title: 'Smart Allocation',
    description: 'Intelligent bed and resource assignment based on patient needs.'
  },
  {
    icon: BarChart3,
    title: 'Predictive Planning',
    description: '7-30 day demand forecasting for proactive resource management.'
  },
];

const stats = [
  { value: '95%', label: 'Triage Accuracy' },
  { value: '40%', label: 'Reduced Wait Time' },
  { value: '24/7', label: 'Real-time Monitoring' },
  { value: '500+', label: 'Hospitals Ready' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${hospitalHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-primary/20" />
        </div>

        {/* Animated Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Floating Medical Icons */}
        <motion.div
          className="absolute top-32 right-20 text-primary/20"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Heart className="h-16 w-16" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-primary/20"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Stethoscope className="h-20 w-20" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div 
                className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Activity className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <h1 className="text-4xl font-bold text-foreground">MedTriage AI</h1>
            </div>

            <motion.h2
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Autonomous Hospital<br />
              <span className="text-primary">Triage & Resource</span><br />
              Allocation System
            </motion.h2>

            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              AI-powered multi-agent decision system for real-time patient classification, 
              risk prediction, and intelligent resource management.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button 
                size="lg" 
                className="gap-2 px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/30"
                onClick={() => navigate('/patient-intake')}
              >
                Enter System
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 px-8 py-6 text-lg rounded-xl"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Multi-Agent Decision Architecture
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI system employs multiple specialized agents working together to deliver
              accurate, explainable, and actionable healthcare decisions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
            <Users className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Hospital Operations?
            </h3>
            <p className="text-muted-foreground mb-8">
              Experience the future of healthcare triage with our AI-powered system.
            </p>
            <Button 
              size="lg" 
              className="gap-2 px-10 py-6 text-lg rounded-xl"
              onClick={() => navigate('/patient-intake')}
            >
              Start Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">MedTriage AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 MedTriage AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
