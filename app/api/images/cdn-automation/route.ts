import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
// @ts-ignore
import { v2 as cloudinary } from 'cloudinary';

// Initialize Supabase client
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ImageOptimizationRequest {
  action: 'upload' | 'convert' | 'optimize' | 'batch-process' | 'analyze';
  imageUrl?: string;
  localPath?: string;
  options?: {
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'auto';
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    gravity?: 'auto' | 'face' | 'center';
    progressive?: boolean;
    lossless?: boolean;
  };
  cdnProvider?: 'cloudinary' | 'bunnycdn' | 'both';
  folder?: string;
  tags?: string[];
}

interface ImageProcessingResult {
  success: boolean;
  originalUrl?: string;
  optimizedUrl?: string;
  webpUrl?: string;
  stats?: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    savingsPercent: number;
    format: string;
    dimensions: { width: number; height: number };
  };
  cdnUrls?: {
    cloudinary?: string;
    bunnycdn?: string;
  };
  error?: string;
}

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const requestData: ImageOptimizationRequest = await req.json();
    const { action, imageUrl, localPath, options = {}, cdnProvider = 'cloudinary', folder = 'agents', tags = [] } = requestData;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    let result: ImageProcessingResult;

    switch (action) {
      case 'upload':
        result = await handleImageUpload(imageUrl || localPath!, options, cdnProvider, folder, tags);
        break;
      case 'convert':
        result = await handleImageConversion(imageUrl!, options);
        break;
      case 'optimize':
        result = await handleImageOptimization(imageUrl!, options);
        break;
      case 'batch-process':
        result = await handleBatchProcessing(options);
        break;
      case 'analyze': {
        // Handle both imageUrl and imagePath (convert local path to full URL)
        const urlToAnalyze = imageUrl || (localPath ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${localPath}` : '');
        if (!urlToAnalyze) {
          return NextResponse.json(
            { success: false, error: 'Missing imageUrl or imagePath for analysis' },
            { status: 400 }
          );
        }
        result = await handleImageAnalysis(urlToAnalyze);
        break;
      }
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    // Log the operation
    await logImageOperation(supabase, action, result, requestData);

    console.log(`[CDN Automation] ${action} completed:`, result.success ? 'Success' : 'Failed');

    return NextResponse.json({
      success: result.success,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[CDN Automation] Error processing request:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process image operation',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const { searchParams } = new URL(req.url);
    const operation = searchParams.get('operation') || 'status';
    const imageId = searchParams.get('imageId');
    const format = searchParams.get('format') || 'json';

    switch (operation) {
      case 'status':
        return await getOptimizationStatus(supabase);
      case 'analytics':
        return await getImageAnalytics(supabase, format);
      case 'image-info':
        if (!imageId) {
          return NextResponse.json({ success: false, error: 'Missing imageId parameter' }, { status: 400 });
        }
        return await getImageInfo(imageId);
      case 'bulk-status':
        return await getBulkProcessingStatus(supabase);
      default:
        return NextResponse.json({ success: false, error: 'Invalid operation' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[CDN Automation] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get image data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper Functions

async function handleImageUpload(
  imagePath: string, 
  options: any, 
  cdnProvider: string, 
  folder: string, 
  tags: string[]
): Promise<ImageProcessingResult> {
  try {
    const uploadOptions = {
      folder,
      tags: [...tags, 'skrbl-ai', 'automated'],
      quality: options.quality || 'auto:good',
      format: options.format || 'auto',
      fetch_format: 'auto',
      flags: 'progressive',
      transformation: buildTransformation(options)
    };

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imagePath, uploadOptions);
    
    // Generate optimized URLs
    const webpUrl = cloudinary.url(uploadResult.public_id, {
      format: 'webp',
      quality: 'auto:good',
      fetch_format: 'auto'
    });

    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      quality: 'auto:good',
      format: 'auto',
      fetch_format: 'auto'
    });

    // Calculate file sizes and savings
    const stats = await calculateImageStats(uploadResult.secure_url, optimizedUrl, webpUrl);

    const result: ImageProcessingResult = {
      success: true,
      originalUrl: uploadResult.secure_url,
      optimizedUrl,
      webpUrl,
      stats,
      cdnUrls: {
        cloudinary: uploadResult.secure_url
      }
    };

    // Upload to BunnyCDN if requested
    if (cdnProvider === 'bunnycdn' || cdnProvider === 'both') {
      result.cdnUrls!.bunnycdn = await uploadToBunnyCDN(uploadResult.secure_url, folder);
    }

    return result;

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
}

async function handleImageConversion(imageUrl: string, options: any): Promise<ImageProcessingResult> {
  try {
    // Extract public ID from Cloudinary URL or use direct transformation
    const publicId = extractPublicId(imageUrl);
    
    if (publicId) {
      // Use Cloudinary transformation
      const webpUrl = cloudinary.url(publicId, {
        format: 'webp',
        quality: options.quality || 'auto:good',
        ...buildTransformation(options)
      });

      const optimizedUrl = cloudinary.url(publicId, {
        format: options.format || 'auto',
        quality: options.quality || 'auto:good',
        ...buildTransformation(options)
      });

      const stats = await calculateImageStats(imageUrl, optimizedUrl, webpUrl);

      return {
        success: true,
        originalUrl: imageUrl,
        optimizedUrl,
        webpUrl,
        stats
      };
    } else {
      // Direct URL transformation (for external images)
      const transformedUrl = await transformExternalImage(imageUrl, options);
      
      return {
        success: true,
        originalUrl: imageUrl,
        optimizedUrl: transformedUrl,
        webpUrl: transformedUrl
      };
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to convert image'
    };
  }
}

async function handleImageOptimization(imageUrl: string, options: any): Promise<ImageProcessingResult> {
  try {
    const optimizationResult = await cloudinary.uploader.explicit(extractPublicId(imageUrl) || imageUrl, {
      type: 'upload',
      eager: [
        { format: 'webp', quality: 'auto:good' },
        { format: 'jpg', quality: 'auto:good' },
        { format: 'png', quality: 'auto:good' }
      ]
    });

    const webpTransform = optimizationResult.eager?.find((t: any) => t.format === 'webp');
    const optimizedTransform = optimizationResult.eager?.find((t: any) => t.format !== 'webp');

    const stats = await calculateImageStats(
      optimizationResult.secure_url,
      optimizedTransform?.secure_url || optimizationResult.secure_url,
      webpTransform?.secure_url || optimizationResult.secure_url
    );

    return {
      success: true,
      originalUrl: optimizationResult.secure_url,
      optimizedUrl: optimizedTransform?.secure_url || optimizationResult.secure_url,
      webpUrl: webpTransform?.secure_url || optimizationResult.secure_url,
      stats
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to optimize image'
    };
  }
}

async function handleBatchProcessing(options: any): Promise<ImageProcessingResult> {
  try {
    // Get list of images to process from public/images directory or database
    const agentImages = [
      'agents-adcreative-nobg-skrblai.png',
      'agents-branding-nobg-skrblai.png',
      'agents-contentcreation-nobg-skrblai.png',
      // Add more agent images as needed
    ];

    const results = [];
    let totalSavings = 0;
    let processedCount = 0;

    for (const imageName of agentImages) {
      try {
        const imagePath = `/images/${imageName}`;
        const uploadResult = await handleImageUpload(imagePath, options, 'cloudinary', 'agents', ['batch-processed']);
        
        if (uploadResult.success && uploadResult.stats) {
          totalSavings += uploadResult.stats.savings;
          processedCount++;
        }
        
        results.push({ imageName, result: uploadResult });
      } catch (error) {
        console.error(`[CDN Automation] Failed to process ${imageName}:`, error);
        results.push({ imageName, result: { success: false, error: (error as Error).message } });
      }
    }

    return {
      success: true,
      stats: {
        originalSize: 0,
        optimizedSize: 0,
        savings: totalSavings,
        savingsPercent: 0,
        format: 'batch',
        dimensions: { width: 0, height: 0 }
      },
      error: `Processed ${processedCount}/${agentImages.length} images. Total savings: ${Math.round(totalSavings / 1024 / 1024)}MB`
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process batch'
    };
  }
}

async function handleImageAnalysis(imageUrl: string): Promise<ImageProcessingResult> {
  try {
    // Check if this is a Cloudinary URL
    const publicId = extractPublicId(imageUrl);
    
    if (publicId) {
      // Use Cloudinary's analysis API for Cloudinary images
      const analysisResult = await cloudinary.api.resource(publicId, {
        image_metadata: true,
        colors: true,
        faces: true,
        quality_analysis: true
      });

      return {
        success: true,
        originalUrl: imageUrl,
        stats: {
          originalSize: analysisResult.bytes,
          optimizedSize: analysisResult.bytes,
          savings: 0,
          savingsPercent: 0,
          format: analysisResult.format,
          dimensions: {
            width: analysisResult.width,
            height: analysisResult.height
          }
        }
      };
    } else {
      // For local or non-Cloudinary images, perform basic analysis
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');
        
        const originalSize = contentLength ? parseInt(contentLength) : 0;
        const format = contentType?.split('/')[1] || 'unknown';
        
        // Estimate potential savings based on format and size
        const estimatedWebpSavings = format === 'png' ? 0.6 : 0.3; // PNG saves ~40%, JPG saves ~30%
        const estimatedOptimizedSize = Math.round(originalSize * (1 - estimatedWebpSavings));
        const savings = originalSize - estimatedOptimizedSize;
        const savingsPercent = (savings / originalSize) * 100;

        return {
          success: true,
          originalUrl: imageUrl,
          stats: {
            originalSize,
            optimizedSize: estimatedOptimizedSize,
            savings,
            savingsPercent,
            format,
            dimensions: { width: 0, height: 0 } // Would need image processing library for exact dimensions
          }
        };
      } catch (fetchError: any) {
        return {
          success: false,
          error: `Failed to analyze image: ${fetchError.message}`
        };
      }
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to analyze image'
    };
  }
}

// Utility Functions

function buildTransformation(options: any) {
  const transformation: any = {};

  if (options.width) transformation.width = options.width;
  if (options.height) transformation.height = options.height;
  if (options.crop) transformation.crop = options.crop;
  if (options.gravity) transformation.gravity = options.gravity;
  if (options.quality) transformation.quality = options.quality;

  return transformation;
}

function extractPublicId(url: string): string | null {
  // Extract Cloudinary public ID from URL
  const cloudinaryPattern = /cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
  const match = url.match(cloudinaryPattern);
  return match ? match[1] : null;
}

async function transformExternalImage(imageUrl: string, options: any): Promise<string> {
  // For external images, we'd need to upload them first or use fetch transformations
  const uploadResult = await cloudinary.uploader.upload(imageUrl, {
    folder: 'external',
    transformation: buildTransformation(options)
  });
  
  return uploadResult.secure_url;
}

async function uploadToBunnyCDN(imageUrl: string, folder: string): Promise<string> {
  // Placeholder for BunnyCDN integration
  // This would require BunnyCDN API implementation
  console.log('[CDN Automation] BunnyCDN upload placeholder:', imageUrl, folder);
  return imageUrl; // Return original URL as placeholder
}

async function calculateImageStats(originalUrl: string, optimizedUrl: string, webpUrl: string) {
  try {
    // Estimate file sizes (in production, you'd fetch actual file sizes)
    const originalSize = await estimateFileSize(originalUrl);
    const optimizedSize = await estimateFileSize(optimizedUrl);
    const webpSize = await estimateFileSize(webpUrl);

    const bestSize = Math.min(optimizedSize, webpSize);
    const savings = originalSize - bestSize;
    const savingsPercent = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize: bestSize,
      savings,
      savingsPercent,
      format: bestSize === webpSize ? 'webp' : 'optimized',
      dimensions: { width: 0, height: 0 } // Would be fetched from actual image metadata
    };
  } catch (error) {
    return {
      originalSize: 0,
      optimizedSize: 0,
      savings: 0,
      savingsPercent: 0,
      format: 'unknown',
      dimensions: { width: 0, height: 0 }
    };
  }
}

async function estimateFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch (error) {
    return 0;
  }
}

async function logImageOperation(supabase: any, action: string, result: ImageProcessingResult, requestData: any) {
  try {
    if (!supabase) {
      console.warn('[CDN_AUTOMATION] Supabase not available, skipping operation logging');
      return;
    }
    
    await supabase
      .from('image_operations_log')
      .insert({
        action,
        success: result.success,
        original_url: result.originalUrl,
        optimized_url: result.optimizedUrl,
        webp_url: result.webpUrl,
        savings_bytes: result.stats?.savings || 0,
        savings_percent: result.stats?.savingsPercent || 0,
        error_message: result.error,
        request_data: JSON.stringify(requestData),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('[CDN Automation] Failed to log operation:', error);
  }
}

// GET endpoint helpers

async function getOptimizationStatus(supabase: any) {
  if (!supabase) {
    return { recentOperations: [], totalOperations: 0, successRate: 0 };
  }
  
  const { data: recentOperations } = await supabase
    .from('image_operations_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: stats } = await supabase
    .from('image_operations_log')
    .select('savings_bytes, savings_percent, success')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const totalSavings = stats?.reduce((sum: number, op: any) => sum + (op.savings_bytes || 0), 0) || 0;
  const successRate = stats?.length ? (stats.filter((op: any) => op.success).length / stats.length) * 100 : 0;

  return NextResponse.json({
    success: true,
    status: {
      recentOperations: recentOperations || [],
      totalSavings24h: totalSavings,
      successRate24h: Math.round(successRate),
      operationsCount24h: stats?.length || 0
    },
    timestamp: new Date().toISOString()
  });
}

async function getImageAnalytics(supabase: any, format: string) {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database service unavailable'
    }, { status: 503 });
  }
  
  const { data: analytics } = await supabase
    .from('image_operations_log')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const summary = {
    totalOperations: analytics?.length || 0,
    totalSavings: analytics?.reduce((sum: number, op: any) => sum + (op.savings_bytes || 0), 0) || 0,
    avgSavingsPercent: analytics?.length ? 
      analytics.reduce((sum: number, op: any) => sum + (op.savings_percent || 0), 0) / analytics.length : 0,
    successRate: analytics?.length ? 
      (analytics.filter((op: any) => op.success).length / analytics.length) * 100 : 0,
    topActions: getTopActions(analytics || [])
  };

  return NextResponse.json({
    success: true,
    analytics: summary,
    timestamp: new Date().toISOString()
  });
}

async function getImageInfo(imageId: string) {
  try {
    const info = await cloudinary.api.resource(imageId, {
      image_metadata: true,
      colors: true
    });

    return NextResponse.json({
      success: true,
      imageInfo: info,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get image info'
    }, { status: 404 });
  }
}

async function getBulkProcessingStatus(supabase: any) {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database service unavailable'
    }, { status: 503 });
  }
  
  // Check if there are any ongoing bulk operations
  const { data: bulkOps } = await supabase
    .from('image_operations_log')
    .select('*')
    .eq('action', 'batch-process')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    success: true,
    bulkOperations: bulkOps || [],
    timestamp: new Date().toISOString()
  });
}

function getTopActions(analytics: any[]): any[] {
  const actionCounts = analytics.reduce((acc, op) => {
    acc[op.action] = (acc[op.action] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5);
} 