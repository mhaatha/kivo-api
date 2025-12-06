import { getAuth } from '@clerk/express';
import * as bmcService from '../services/bmc.service.js';
import { validateBmcUpdate, validateBmcId } from '../validations/bmc.validation.js';

/**
 * GET /api/bmc/public - Get all public BMC posts
 */
export async function getPublicBmcPosts(req, res) {
  try {
    const bmcPosts = await bmcService.getPublicBmcPosts();

    return res.status(200).json({
      success: true,
      count: bmcPosts.length,
      data: bmcPosts,
    });
  } catch (error) {
    console.error('Get Public BMC Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get public BMC data.',
    });
  }
}

/**
 * GET /api/bmc/:id - Get BMC by ID
 */
export async function getBmcById(req, res) {
  try {
    const validation = validateBmcId({ id: req.params.id });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BMC ID format.',
      });
    }

    const bmcPost = await bmcService.getBmcById(req.params.id);
    if (!bmcPost) {
      return res.status(404).json({
        success: false,
        message: 'BMC data not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: bmcPost,
    });
  } catch (error) {
    console.error('Get BMC Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid BMC ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to get BMC data.',
    });
  }
}

/**
 * GET /api/bmc/my - Get all BMCs for current user
 */
export async function getMyBmcPosts(req, res) {
  const { userId } = getAuth(req);

  try {
    const bmcPosts = await bmcService.getBmcsByAuthorId(userId);

    return res.status(200).json({
      success: true,
      count: bmcPosts.length,
      data: bmcPosts,
    });
  } catch (error) {
    console.error('Get My BMC Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get BMC data.',
    });
  }
}

/**
 * POST /api/bmc - Create new BMC
 */
export async function createBmc(req, res) {
  const { userId } = getAuth(req);
  const { items, isPublic } = req.body;

  try {
    const bmcPost = await bmcService.createBmc(userId, items || [], isPublic || false);

    return res.status(201).json({
      success: true,
      message: 'BMC created successfully.',
      data: bmcPost,
    });
  } catch (error) {
    console.error('Create BMC Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create BMC.',
    });
  }
}

/**
 * PUT /api/bmc/:id - Update BMC
 */
export async function updateBmc(req, res) {
  const { userId } = getAuth(req);
  const bmcId = req.params.id;
  const { items } = req.body;

  // Validate request
  const validation = validateBmcUpdate({ items });
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'BMC items cannot be empty.',
      details: validation.error?.errors,
    });
  }

  try {
    const updatedBmc = await bmcService.updateBmcById(bmcId, userId, items);

    if (!updatedBmc) {
      return res.status(404).json({
        success: false,
        message: 'BMC not found or you do not have permission to update.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'BMC updated successfully.',
      data: updatedBmc,
    });
  } catch (error) {
    console.error('Update BMC Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid BMC ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update BMC.',
    });
  }
}

/**
 * DELETE /api/bmc/:id - Delete BMC
 */
export async function deleteBmc(req, res) {
  const { userId } = getAuth(req);
  const bmcId = req.params.id;

  try {
    const deletedBmc = await bmcService.deleteBmcById(bmcId, userId);

    if (!deletedBmc) {
      return res.status(404).json({
        success: false,
        message: 'BMC not found or you do not have permission to delete.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'BMC deleted successfully.',
    });
  } catch (error) {
    console.error('Delete BMC Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete BMC.',
    });
  }
}

/**
 * GET /api/bmc/chat/:chatId - Get BMC by chat ID
 */
export async function getBmcByChatId(req, res) {
  const { chatId } = req.params;

  try {
    const bmcPost = await bmcService.getBmcByChatId(chatId);
    if (!bmcPost) {
      return res.status(404).json({
        success: false,
        message: 'BMC data not found for this chat.',
      });
    }

    return res.status(200).json({
      success: true,
      data: bmcPost,
    });
  } catch (error) {
    console.error('Get BMC by Chat ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get BMC data.',
    });
  }
}

/**
 * PATCH /api/bmc/:id/visibility - Toggle BMC visibility
 */
export async function toggleVisibility(req, res) {
  const { userId } = getAuth(req);
  const bmcId = req.params.id;

  try {
    const updatedBmc = await bmcService.toggleBmcVisibility(bmcId, userId);

    if (!updatedBmc) {
      return res.status(404).json({
        success: false,
        message: 'BMC not found or you do not have permission to update.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `BMC is now ${updatedBmc.isPublic ? 'public' : 'private'}.`,
      data: updatedBmc,
    });
  } catch (error) {
    console.error('Toggle Visibility Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle BMC visibility.',
    });
  }
}
