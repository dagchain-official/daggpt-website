/**
 * Content Extractor Service
 * Extracts specific details from user requests (names, professions, etc.)
 * NO MORE GENERIC "JOHN DOE" PLACEHOLDERS!
 */

/**
 * Extract person's name from user request
 */
export function extractPersonName(userRequest) {
  const lowerRequest = userRequest.toLowerCase();
  
  // Pattern 1: "for [name]" or "about [name]"
  const forPattern = /(?:for|about|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const forMatch = userRequest.match(forPattern);
  if (forMatch) {
    const name = forMatch[0].replace(/(?:for|about|of)\s+/i, '').trim();
    if (name && name !== 'me' && name !== 'my' && name.length > 2) {
      return name;
    }
  }
  
  // Pattern 2: "name is [name]" or "called [name]"
  const namePattern = /(?:name is|called|named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const nameMatch = userRequest.match(namePattern);
  if (nameMatch) {
    const name = nameMatch[0].replace(/(?:name is|called|named)\s+/i, '').trim();
    if (name && name.length > 2) {
      return name;
    }
  }
  
  // Pattern 3: Look for capitalized names in the text
  const capitalPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g;
  const capitalMatches = userRequest.match(capitalPattern);
  if (capitalMatches && capitalMatches.length > 0) {
    // Filter out common words
    const commonWords = ['Make', 'Build', 'Create', 'Design', 'Portfolio', 'Website', 'Page', 'App', 'Site', 'Web', 'The', 'This', 'That', 'With', 'For', 'And', 'But', 'Or'];
    const filtered = capitalMatches.filter(word => !commonWords.includes(word));
    if (filtered.length > 0) {
      return filtered[0];
    }
  }
  
  return null;
}

/**
 * Extract profession/role from user request
 */
export function extractProfession(userRequest) {
  const lowerRequest = userRequest.toLowerCase();
  
  // Common professions and roles
  const professions = {
    // Sports
    'badminton player': 'Badminton Player',
    'tennis player': 'Tennis Player',
    'football player': 'Football Player',
    'cricket player': 'Cricket Player',
    'basketball player': 'Basketball Player',
    'athlete': 'Professional Athlete',
    'coach': 'Sports Coach',
    'trainer': 'Fitness Trainer',
    
    // Tech
    'developer': 'Full Stack Developer',
    'web developer': 'Web Developer',
    'software engineer': 'Software Engineer',
    'frontend developer': 'Frontend Developer',
    'backend developer': 'Backend Developer',
    'full stack developer': 'Full Stack Developer',
    'programmer': 'Software Developer',
    'coder': 'Software Developer',
    
    // Design
    'designer': 'UI/UX Designer',
    'ui designer': 'UI Designer',
    'ux designer': 'UX Designer',
    'graphic designer': 'Graphic Designer',
    'web designer': 'Web Designer',
    
    // Business
    'entrepreneur': 'Entrepreneur',
    'founder': 'Founder & CEO',
    'ceo': 'Chief Executive Officer',
    'manager': 'Project Manager',
    'consultant': 'Business Consultant',
    
    // Creative
    'photographer': 'Professional Photographer',
    'videographer': 'Videographer',
    'artist': 'Creative Artist',
    'musician': 'Musician',
    'writer': 'Content Writer',
    'blogger': 'Blogger',
    
    // Other
    'student': 'Student',
    'teacher': 'Educator',
    'doctor': 'Medical Professional',
    'lawyer': 'Legal Professional'
  };
  
  // Check for exact matches
  for (const [key, value] of Object.entries(professions)) {
    if (lowerRequest.includes(key)) {
      return value;
    }
  }
  
  // Pattern: "I am a [profession]" or "I'm a [profession]"
  const iAmPattern = /(?:i am|i'm|i am a|i'm a)\s+([a-z\s]+?)(?:\s+(?:and|with|who|that)|$)/i;
  const iAmMatch = lowerRequest.match(iAmPattern);
  if (iAmMatch) {
    const profession = iAmMatch[1].trim();
    return capitalizeWords(profession);
  }
  
  return null;
}

/**
 * Extract project description/tagline
 */
export function extractDescription(userRequest, profession) {
  const lowerRequest = userRequest.toLowerCase();
  
  // Default descriptions based on profession
  const defaultDescriptions = {
    'Badminton Player': 'Professional badminton player with national and international achievements',
    'Tennis Player': 'Professional tennis player competing at the highest level',
    'Football Player': 'Professional football player with passion for the game',
    'Cricket Player': 'Professional cricket player representing at various levels',
    'Basketball Player': 'Professional basketball player with exceptional skills',
    'Professional Athlete': 'Dedicated athlete striving for excellence',
    'Full Stack Developer': 'Building modern web applications with cutting-edge technologies',
    'Web Developer': 'Creating beautiful and functional websites',
    'Software Engineer': 'Solving complex problems through elegant code',
    'UI/UX Designer': 'Designing intuitive and beautiful user experiences',
    'Graphic Designer': 'Creating visual stories through design',
    'Photographer': 'Capturing moments that tell stories',
    'Entrepreneur': 'Building innovative solutions for tomorrow',
    'Content Writer': 'Crafting compelling stories and content'
  };
  
  // Check for explicit description
  const descPattern = /(?:who|that)\s+([^.!?]+)/i;
  const descMatch = userRequest.match(descPattern);
  if (descMatch) {
    return descMatch[1].trim();
  }
  
  // Return default based on profession
  return defaultDescriptions[profession] || 'Passionate professional dedicated to excellence';
}

/**
 * Extract contact information
 */
export function extractContactInfo(userRequest) {
  const contact = {};
  
  // Email pattern
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatch = userRequest.match(emailPattern);
  if (emailMatch) {
    contact.email = emailMatch[0];
  }
  
  // Phone pattern
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = userRequest.match(phonePattern);
  if (phoneMatch) {
    contact.phone = phoneMatch[0];
  }
  
  // Social media handles
  const twitterPattern = /@([a-zA-Z0-9_]+)/g;
  const twitterMatch = userRequest.match(twitterPattern);
  if (twitterMatch) {
    contact.twitter = twitterMatch[0];
  }
  
  return contact;
}

/**
 * Extract achievements/highlights
 */
export function extractAchievements(userRequest) {
  const achievements = [];
  const lowerRequest = userRequest.toLowerCase();
  
  // Look for achievement keywords
  const achievementKeywords = [
    'won', 'winner', 'champion', 'award', 'medal', 'trophy',
    'national', 'international', 'state', 'district',
    'first place', 'second place', 'third place',
    'gold', 'silver', 'bronze',
    'certified', 'qualified', 'ranked'
  ];
  
  achievementKeywords.forEach(keyword => {
    if (lowerRequest.includes(keyword)) {
      // Extract the sentence containing the achievement
      const sentences = userRequest.split(/[.!?]/);
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(keyword)) {
          achievements.push(sentence.trim());
        }
      });
    }
  });
  
  return achievements;
}

/**
 * Main function to extract all user details
 */
export function extractUserDetails(userRequest) {
  const name = extractPersonName(userRequest);
  const profession = extractProfession(userRequest);
  const description = extractDescription(userRequest, profession);
  const contact = extractContactInfo(userRequest);
  const achievements = extractAchievements(userRequest);
  
  return {
    name: name || 'Your Name',
    profession: profession || 'Professional',
    description,
    contact,
    achievements,
    hasRealData: !!(name || profession) // Flag to indicate if we have real data
  };
}

/**
 * Generate personalized content prompt
 */
export function generatePersonalizedPrompt(userDetails) {
  if (!userDetails.hasRealData) {
    return ''; // No personalization needed
  }
  
  let prompt = '\n\n🎯 PERSONALIZATION (CRITICAL - USE EXACT DETAILS):\n\n';
  
  if (userDetails.name && userDetails.name !== 'Your Name') {
    prompt += `**NAME:** ${userDetails.name}\n`;
    prompt += `- Use "${userDetails.name}" everywhere, NOT "John Doe" or generic names!\n`;
    prompt += `- Update all text, headings, and meta tags with this name\n\n`;
  }
  
  if (userDetails.profession && userDetails.profession !== 'Professional') {
    prompt += `**PROFESSION:** ${userDetails.profession}\n`;
    prompt += `- Use "${userDetails.profession}" as the role/title\n`;
    prompt += `- NOT "Full Stack Developer" or generic roles!\n`;
    prompt += `- Tailor content to this specific profession\n\n`;
  }
  
  if (userDetails.description) {
    prompt += `**DESCRIPTION:** ${userDetails.description}\n`;
    prompt += `- Use this as the tagline/bio\n\n`;
  }
  
  if (userDetails.achievements && userDetails.achievements.length > 0) {
    prompt += `**ACHIEVEMENTS:**\n`;
    userDetails.achievements.forEach((achievement, index) => {
      prompt += `${index + 1}. ${achievement}\n`;
    });
    prompt += '\n';
  }
  
  if (userDetails.contact.email) {
    prompt += `**EMAIL:** ${userDetails.contact.email}\n`;
  }
  
  if (userDetails.contact.phone) {
    prompt += `**PHONE:** ${userDetails.contact.phone}\n`;
  }
  
  prompt += '\n⚠️ CRITICAL RULES:\n';
  prompt += '1. Use the EXACT name provided - NO generic placeholders!\n';
  prompt += '2. Use the EXACT profession - NO assumptions!\n';
  prompt += '3. Tailor ALL content to match the profession\n';
  prompt += '4. Replace ALL "John Doe", "Jane Smith", etc. with real name\n';
  prompt += '5. Replace ALL generic roles with the actual profession\n';
  prompt += '6. Make it PERSONAL and SPECIFIC to this individual!\n';
  
  return prompt;
}

/**
 * Helper function to capitalize words
 */
function capitalizeWords(str) {
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validate extracted details
 */
export function validateUserDetails(userDetails) {
  const warnings = [];
  
  if (!userDetails.name || userDetails.name === 'Your Name') {
    warnings.push('No name detected - will use placeholder');
  }
  
  if (!userDetails.profession || userDetails.profession === 'Professional') {
    warnings.push('No profession detected - will use generic role');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}
