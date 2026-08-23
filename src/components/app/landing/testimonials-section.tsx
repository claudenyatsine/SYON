import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "Dr max has transformed the way I study. The live classes are engaging, and the AI tutor helps me find resources I would have never found on my own!",
    author: "Sarah L.",
    role: "Student, Grade 11",
    avatar: {
      src: "https://picsum.photos/seed/testimonial-1/100/100",
      fallback: "SL",
      hint: "student portrait"
    }
  },
  {
    quote: "As a parent, I love being able to track my son's progress. The platform is transparent and gives me peace of mind about his education.",
    author: "David R.",
    role: "Parent",
    avatar: {
      src: "https://picsum.photos/seed/testimonial-2/100/100",
      fallback: "DR",
      hint: "parent portrait"
    }
  },
  {
    quote: "The course management tools are top-notch. Dr max makes it easy to create high-quality content and interact with my students effectively.",
    author: "Mr. Peterson",
    role: "Tutor",
    avatar: {
        src: "https://picsum.photos/seed/testimonial-3/100/100",
        fallback: "MP",
        hint: "teacher portrait"
    }
  }
];

export function TestimonialsSection() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Our Community Says</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Real stories from students, parents, and tutors who love Dr max.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="flex flex-col justify-between">
            <CardContent className="pt-6">
              <blockquote className="text-lg leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </CardContent>
            <div className="flex items-center gap-4 p-6 pt-0">
              <Avatar>
                <AvatarImage src={testimonial.avatar.src} alt={testimonial.author} data-ai-hint={testimonial.avatar.hint} />
                <AvatarFallback>{testimonial.avatar.fallback}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
