# Glassmorphic Design System - Quick Reference

## 🎨 **Core Utility Classes**

### Floating Glassmorphic Card
```jsx
<GlassmorphicCard variant="floating" className="border-accent-color/20">
  {/* Your content */}
</GlassmorphicCard>
```

**Built-in Styles:**
- `bg-white/8` - 8% translucent white background
- `backdrop-blur-xl` - Enhanced backdrop blur
- `border-white/20` - Soft 20% white border
- `rounded-3xl` - Consistent rounded corners
- `mx-4 md:mx-6 lg:mx-8` - Responsive margins (mobile-first)
- `p-6 md:p-8` - Responsive padding
- Custom shadow with border glow effect

### CSS Classes Available

#### Shadow Effects
```css
.shadow-glow          /* Standard glow - matches navbar */
.shadow-glow-intense  /* Enhanced glow for hover states */
```

#### Cosmic Theme Classes (inherited)
```css
.cosmic-glass    /* Original cosmic background */
.cosmic-gradient /* Subtle background gradient */
.cosmic-glow     /* Element glow effect */
```

## 🎯 **Usage Patterns**

### ✅ Recommended Patterns

#### Single Container for Metrics
```jsx
<GlassmorphicCard variant="floating" className="border-cyan-400/20">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div className="text-center">
      <div className="text-3xl font-bold text-cyan-400">2,847+</div>
      <div className="text-gray-300">Companies</div>
    </div>
    {/* More metrics... */}
  </div>
</GlassmorphicCard>
```

#### Individual Cards for Features
```jsx
<div className="grid md:grid-cols-3 gap-8">
  <GlassmorphicCard variant="floating" className="hover:border-electric-blue/50">
    <h3>Feature Title</h3>
    <p>Feature description...</p>
  </GlassmorphicCard>
  {/* More feature cards... */}
</div>
```

#### CTA Sections
```jsx
<GlassmorphicCard variant="floating" className="text-center border-cyan-400/30">
  <h2>Call to Action</h2>
  <p>Compelling description...</p>
  <CosmicButton>Take Action</CosmicButton>
</GlassmorphicCard>
```

### ❌ Avoid These Patterns

#### Nested Cards (Creates Visual Clutter)
```jsx
{/* DON'T DO THIS */}
<GlassmorphicCard variant="floating">
  <GlassmorphicCard variant="floating">
    <div>Nested content</div>
  </GlassmorphicCard>
</GlassmorphicCard>
```

#### Edge-to-Edge on Mobile
```jsx
{/* DON'T DO THIS */}
<GlassmorphicCard variant="floating" className="mx-0">
  {/* This removes responsive margins */}
</GlassmorphicCard>
```

## 🎨 **Border Color System**

### Accent Colors (Use with 20-30% opacity)
```jsx
className="border-cyan-400/20"     // Primary accent
className="border-electric-blue/30" // Electric blue
className="border-green-400/20"    // Success
className="border-red-500/30"      // Warning/Error  
className="border-purple-500/20"   // Premium
className="border-orange-500/30"   // Attention
```

### Hover Effects
```jsx
className="border-cyan-400/20 hover:border-cyan-400/40 transition-colors"
```

## 📱 **Responsive Guidelines**

### Margin System
- **Mobile (default)**: `mx-4` (16px) - Comfortable phone spacing
- **Tablet (`md:`)**: `mx-6` (24px) - Balanced tablet spacing  
- **Desktop (`lg:`)**: `mx-8` (32px) - Optimal desktop spacing

### Padding System
- **Mobile (default)**: `p-6` (24px) - Readable content spacing
- **Desktop (`md:`)**: `p-8` (32px) - Enhanced desktop experience

### When to Override
```jsx
{/* For special layouts, you can override margins */}
<GlassmorphicCard variant="floating" className="mx-2 md:mx-4">
  {/* Tighter spacing for dense layouts */}
</GlassmorphicCard>
```

## 🎭 **Variant Selection Guide**

### Use `variant="floating"` for:
- Main page content sections
- Metrics dashboards  
- Product showcases
- Testimonial collections
- CTA sections
- Feature comparisons

### Use `variant="default"` (or no variant) for:
- Modal content
- Special emphasis cards
- Existing cosmic-glass designs
- When you need custom padding/margins

## 🔧 **Advanced Customization**

### Custom Gradients
```jsx
<GlassmorphicCard 
  variant="floating" 
  className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/30"
>
  {/* Custom gradient background */}
</GlassmorphicCard>
```

### Animation Classes
```jsx
<GlassmorphicCard 
  variant="floating" 
  className="hover:scale-[1.01] transition-transform duration-300"
>
  {/* Custom hover animation */}
</GlassmorphicCard>
```

### Special States
```jsx
<GlassmorphicCard 
  variant="floating" 
  className="ring-2 ring-cyan-400/50 border-cyan-400/50"
>
  {/* Selected/Active state */}
</GlassmorphicCard>
```

## 🎨 **Design Tokens**

### Background Opacity
- **Floating cards**: `bg-white/8` (8% - subtle)
- **Hover states**: Can increase to `bg-white/12` (12%)
- **Active states**: Can increase to `bg-white/16` (16%)

### Border Opacity  
- **Default**: `border-white/20` (20%)
- **Hover**: `border-white/30` (30%)
- **Accent colors**: `/20` to `/30` range

### Shadow System
- **Base**: Custom shadow with glow accent
- **Hover**: Enhanced shadow with increased opacity
- **Focus**: Add ring utilities for accessibility

---

## 🎯 **Quick Decision Tree**

**Question**: Are you displaying multiple related data points (metrics, stats)?
- **Yes** → Use single floating card with grid layout inside
- **No** → Continue...

**Question**: Are you showing distinct, separate content pieces (features, testimonials)?  
- **Yes** → Use individual floating cards
- **No** → Continue...

**Question**: Is this a call-to-action or main content section?
- **Yes** → Use single floating card
- **No** → Consider if you need a card at all

**Question**: Do you need cosmic-glass styling specifically?
- **Yes** → Use default variant
- **No** → Use floating variant

This system ensures consistent, beautiful glassmorphic design that scales perfectly from mobile to desktop while maintaining optimal performance and accessibility.